import type { AdapterExecutionContext, AdapterExecutionResult } from "@paperclipai/adapter-utils";
import {
  DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE,
  joinPromptSections,
  renderPaperclipWakePrompt,
  renderTemplate,
  selectPaperclipTaskMarkdown,
} from "@paperclipai/adapter-utils/server-utils";
import { runSshCommand, shellQuote, type SshConnectionConfig, type SshCommandResult } from "@paperclipai/adapter-utils/ssh";
import {
  buildRequest,
  encodeRequest,
  parseResponse,
  PROTOCOL,
  type PaperclipDispositionReceipt,
  type RunnerResponse,
  type RunnerState,
} from "./protocol.js";

export type DshSshConfig = {
  host: string;
  port: number;
  username: string;
  runnerCommand: string;
  labStateRoot: string;
  principal: string;
  privateKey: string | null;
  knownHosts: string;
  strictHostKeyChecking: boolean;
  dshLabRoot: string | null;
  mode: "finish" | "hang" | null;
  timeoutMs: number;
};

type SshTransport = (
  config: SshConnectionConfig,
  remoteCommand: string,
  options: { env?: Record<string, string>; stdin?: string; timeoutMs?: number; maxBuffer?: number },
) => Promise<SshCommandResult>;

const MAX_TASK_CODE_POINTS = 10_000;
const REAL_RUNNER_COMMAND = "/home/quancoo/[Hermes]-DSH-Paperclip-draft-2/[Hermes]-supervisor-draft-2.py";
const SYNTHETIC_RUNNER_COMMAND = "/home/quancoo/[Hermes]-DSH-Paperclip-draft-2/[Hermes]-supervisor-draft-2-synthetic.py";
const MAX_RETRIES = 3;
let pollIntervalMs = 250;
let settleMs = 5_000;
const TERMINAL_STATES = new Set<RunnerState>(["completed", "cancelled", "timed_out", "failed"]);
let sshTransport: SshTransport = runSshCommand;

export function setSshTransportForTest(transport: SshTransport | null): void {
  sshTransport = transport ?? runSshCommand;
}

export function setTimingForTest(timing: { pollIntervalMs: number; settleMs: number } | null): void {
  pollIntervalMs = timing?.pollIntervalMs ?? 250;
  settleMs = timing?.settleMs ?? 5_000;
}

function string(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function integer(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isInteger(value)) return fallback;
  return value;
}

function configError(message: string): AdapterExecutionResult {
  return { exitCode: 1, signal: null, timedOut: false, errorCode: "dsh_ssh_config_invalid", errorMessage: message };
}

export function resolveConfig(raw: Record<string, unknown>): DshSshConfig | string {
  if (raw.labOnly !== true) return "DSH SSH is a lab-only adapter; set labOnly to true.";
  const host = string(raw.host);
  const username = string(raw.username);
  const synthetic = raw.synthetic === true;
  const runnerCommand = synthetic ? SYNTHETIC_RUNNER_COMMAND : REAL_RUNNER_COMMAND;
  const labStateRoot = string(raw.labStateRoot);
  const principal = string(raw.principal);
  const privateKey = string(raw.privateKey);
  const knownHosts = string(raw.knownHosts);
  const port = integer(raw.port, 22);
  const timeoutMs = integer(raw.timeoutMs, 3_600_000);
  const mode = raw.mode === undefined ? null : raw.mode === "finish" || raw.mode === "hang" ? raw.mode : "invalid";
  if (!host || !username || !labStateRoot || !principal || !privateKey || !knownHosts) return "DSH SSH requires host, username, labStateRoot, principal, privateKey, and knownHosts.";
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(principal)) return "DSH SSH principal must match the runner identifier format.";
  if (!runnerCommand.startsWith("/")) return "DSH SSH runnerCommand must be an approved absolute runner path.";
  if (!labStateRoot.startsWith("/")) return "DSH SSH labStateRoot must be an absolute path.";
  if (port < 1 || port > 65_535) return "DSH SSH port must be an integer from 1 to 65535.";
  if (timeoutMs < 100 || timeoutMs > 3_600_000) return "DSH SSH timeoutMs must be an integer from 100 to 3600000.";
  if (mode === "invalid") return "DSH SSH mode must be finish or hang when explicitly configured.";
  if (raw.synthetic !== undefined && typeof raw.synthetic !== "boolean") return "DSH SSH synthetic must be a boolean.";
  if (mode !== null && !synthetic) return "DSH SSH synthetic mode requires synthetic to be true.";
  if (synthetic && mode === null) return "DSH SSH synthetic requires an explicit finish or hang mode.";
  if (raw.strictHostKeyChecking !== undefined && typeof raw.strictHostKeyChecking !== "boolean") {
    return "DSH SSH strictHostKeyChecking must be a boolean.";
  }
  if (raw.strictHostKeyChecking !== true) return "DSH SSH requires strict host-key checking.";
  const dshLabRoot = raw.dshLabRoot === undefined ? null : string(raw.dshLabRoot);
  if (raw.runnerCommand !== undefined || raw.nodeCommand !== undefined || raw.paperclipApiUrl !== undefined) return "DSH SSH draft-2 does not accept runner, executable, or Paperclip API URL overrides.";
  if (raw.dshLabRoot !== undefined && !dshLabRoot) return "Optional DSH lab paths must be non-empty strings.";
  if (dshLabRoot && !dshLabRoot.startsWith("/")) return "DSH SSH dshLabRoot must be an absolute path.";
  return {
    host, port, username, runnerCommand, labStateRoot, principal, privateKey, knownHosts,
    strictHostKeyChecking: true,
    dshLabRoot, mode, timeoutMs,
  };
}

function issueId(ctx: AdapterExecutionContext): string | null {
  const issue = ctx.context.paperclipIssue;
  if (typeof issue === "object" && issue !== null && !Array.isArray(issue)) {
    const value = string((issue as Record<string, unknown>).id);
    if (value && /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)) return value;
  }
  const wake = ctx.context.paperclipWake;
  if (typeof wake === "object" && wake !== null && !Array.isArray(wake)) {
    const value = string((wake as Record<string, unknown>).issueId);
    if (value && /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)) return value;
  }
  return null;
}

function buildTask(ctx: AdapterExecutionContext): string | null {
  const task = selectPaperclipTaskMarkdown(ctx.context).trim();
  if (!task) return null;
  const wake = renderPaperclipWakePrompt(ctx.context.paperclipWake);
  const prompt = joinPromptSections([
    renderTemplate(DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE, {
      agent: ctx.agent,
      run: { id: ctx.runId },
    }),
    wake,
    task,
  ]);
  if (Array.from(prompt).length > MAX_TASK_CODE_POINTS) return null;
  return prompt;
}

function sshConfig(config: DshSshConfig): SshConnectionConfig {
  return {
    host: config.host,
    port: config.port,
    username: config.username,
    remoteWorkspacePath: config.labStateRoot,
    privateKey: config.privateKey,
    knownHosts: config.knownHosts,
    strictHostKeyChecking: config.strictHostKeyChecking,
    identitiesOnly: true,
  };
}

function runnerEnvironment(config: DshSshConfig): Record<string, string> {
  return {
    PAPERCLIP_LAB_STATE: config.labStateRoot,
    PAPERCLIP_PRINCIPAL: config.principal,
    ...(config.mode ? { PAPERCLIP_PROFILE_PLUGIN: "synthetic" } : {}),
    ...(config.dshLabRoot ? { DSH_LAB_ROOT: config.dshLabRoot } : {}),
  };
}

async function request(
  config: DshSshConfig,
  payload: Record<string, unknown>,
  expected: "state" | "events",
  deadline: number,
): Promise<RunnerResponse> {
  const stdin = encodeRequest(payload);
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const remainingMs = Math.floor(deadline - Date.now());
    if (remainingMs <= 0) break;
    try {
      const result = await sshTransport(sshConfig(config), config.runnerCommand, {
        env: runnerEnvironment(config),
        stdin,
        timeoutMs: Math.min(config.timeoutMs + settleMs, 35_000, remainingMs),
        maxBuffer: 65_536,
      });
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(result.stdout);
      } catch {
        throw new Error("Invalid runner response.");
      }
      const response = parseResponse(parsedJson, expected, {
        runId:
          payload.op !== "events" && typeof payload.runId === "string"
            ? payload.runId
            : undefined,
        after:
          payload.op === "events" && typeof payload.after === "number"
            ? payload.after
            : undefined,
      });
      if (!response) throw new Error("Invalid runner response.");
      return response;
    } catch {
      if (Date.now() >= deadline) break;
    }
  }
  throw new Error("DSH runner transport failed.");
}

function resultForState(
  runId: string,
  state: RunnerState,
  finalText: string | null,
  receipt: PaperclipDispositionReceipt | null,
): AdapterExecutionResult {
  if (state === "completed" && finalText !== null && receipt !== null) {
    return {
      exitCode: 0,
      signal: null,
      timedOut: false,
      provider: "router-smit",
      model: "gpt-5.6-luna",
      summary: finalText.slice(0, 2_000),
      resultJson: {
        finalResponse: { final: true, text: finalText },
        runnerRunId: runId,
        runnerState: state,
        paperclipDispositionReceipt: receipt,
      },
    };
  }
  const cancellation = state === "cancelled";
  const timedOut = state === "timed_out" || state === "accepted" || state === "running";
  return {
    exitCode: 1,
    signal: cancellation || timedOut ? "SIGTERM" : null,
    timedOut,
    provider: "router-smit",
    model: "gpt-5.6-luna",
    errorCode: cancellation
      ? "dsh_ssh_cancelled"
      : timedOut
        ? "dsh_ssh_timeout"
        : state === "cleanup_pending"
          ? "dsh_ssh_cleanup_pending"
          : state === "completed" && receipt === null
            ? "dsh_ssh_receipt_missing"
            : "dsh_ssh_run_failed",
    errorMessage: timedOut
      ? "DSH runner did not settle before the adapter deadline."
      : state === "completed" && receipt === null
        ? "DSH runner completed without a verified Paperclip disposition receipt."
        : `DSH runner ended in ${state}.`,
    resultJson: { runId, state, final: false },
  };
}

function abortPromise(signal: AbortSignal | undefined): Promise<"aborted"> {
  if (!signal) return new Promise(() => undefined);
  if (signal.aborted) return Promise.resolve("aborted");
  return new Promise((resolve) => signal.addEventListener("abort", () => resolve("aborted"), { once: true }));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function observe(config: DshSshConfig, runId: string, expectedIssueId: string, signal: AbortSignal | undefined, deadline: number): Promise<{ state: RunnerState; finalText: string | null; receipt: PaperclipDispositionReceipt | null; aborted: boolean }> {
  let cursor = 0;
  let finalText: string | null = null;
  let receipt: PaperclipDispositionReceipt | null = null;
  let lastState: RunnerState = "accepted";
  let cancelled = false;
  do {
    if (signal?.aborted && !cancelled) {
      cancelled = true;
      await request(
        config,
        buildRequest({ op: "cancel", runId, owner: config.principal }),
        "state",
        deadline,
      );
    }
    if (Date.now() >= deadline) break;
    const events = await request(
      config,
      buildRequest({ op: "events", runId, owner: config.principal, after: cursor }),
      "events",
      deadline,
    );
    if (events.kind !== "events") throw new Error("Invalid DSH events response.");
    for (const event of events.events) {
      cursor = event.seq;
      if (event.type === "final") finalText = event.data.text;
      if (event.type === "receipt") {
        if (event.data.runId !== runId || event.data.issueId !== expectedIssueId) throw new Error("Mismatched DSH disposition receipt.");
        receipt = event.data;
      }
      if (event.type === "state") lastState = event.data.state;
    }
    const status = await request(
      config,
      buildRequest({ op: "status", runId, owner: config.principal }),
      "state",
      deadline,
    );
    if (status.kind !== "state") throw new Error("Invalid DSH status response.");
    lastState = status.state;
    if (TERMINAL_STATES.has(lastState)) return { state: lastState, finalText, receipt, aborted: cancelled };
    if (Date.now() < deadline) {
      await Promise.race([delay(pollIntervalMs), abortPromise(signal)]);
    }
  } while (Date.now() <= deadline);
  return { state: lastState, finalText, receipt, aborted: cancelled };
}

async function settleCancellation(
  config: DshSshConfig,
  runId: string,
  expectedIssueId: string,
  errorMessage: string,
): Promise<AdapterExecutionResult> {
  const deadline = Date.now() + settleMs;
  try {
    const cancellation = await request(
      config,
      buildRequest({ op: "cancel", runId, owner: config.principal }),
      "state",
      deadline,
    );
    if (cancellation.kind !== "state") throw new Error("Cancel rejected.");
    const settled = await observe(config, runId, expectedIssueId, undefined, deadline);
    if (TERMINAL_STATES.has(settled.state)) {
      return resultForState(runId, settled.state, settled.finalText, settled.receipt);
    }
  } catch {
    // A lost SSH response cannot prove whether the remote run was admitted or stopped.
  }
  return {
    exitCode: 1,
    signal: "SIGTERM",
    timedOut: false,
    errorCode: "dsh_ssh_cleanup_pending",
    errorMessage,
  };
}

export async function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
  const resolved = resolveConfig(ctx.config);
  if (typeof resolved === "string") return configError(resolved);
  const task = buildTask(ctx);
  if (!task) return configError("DSH SSH requires server-authored paperclipTaskMarkdown context.");
  if (ctx.signal?.aborted) return resultForState(ctx.runId, "cancelled", null, null);
  if (!ctx.authToken) return configError("DSH SSH draft-2 requires a run-scoped Paperclip auth token.");
  const taskIssueId = issueId(ctx);
  if (!taskIssueId) return configError("DSH SSH draft-2 requires a server-authored Paperclip issue ID.");
  let startAttempted = false;
  try {
    await ctx.onCancellationReady?.();
    await ctx.onMeta?.({ adapterType: "dsh_ssh", command: "ssh runner", commandArgs: [], context: { runId: ctx.runId, protocol: PROTOCOL } });
    ctx.onDispatch?.();
    const runDeadline = Date.now() + resolved.timeoutMs + settleMs;
    startAttempted = true;
    const started = await request(
      resolved,
      buildRequest({
        op: "start",
        runId: ctx.runId,
        owner: resolved.principal,
        task,
        timeoutMs: resolved.timeoutMs,
        authToken: ctx.authToken,
        agentId: ctx.agent.id,
        companyId: ctx.agent.companyId,
        issueId: taskIssueId,
        ...(resolved.mode ? { mode: resolved.mode } : {}),
      }),
      "state",
      runDeadline,
    );
    if (started.kind === "error") return { exitCode: 1, signal: null, timedOut: false, errorCode: "dsh_ssh_runner_rejected", errorMessage: "DSH runner rejected the start request." };
    const observed = await observe(resolved, ctx.runId, taskIssueId, ctx.signal, runDeadline);
    if (
      (observed.state === "accepted" || observed.state === "running") &&
      !observed.aborted
    ) {
      return settleCancellation(
        resolved,
        ctx.runId,
        taskIssueId,
        "DSH runner timeout cancellation could not be verified.",
      );
    }
    if (observed.state === "completed" && observed.finalText === null) {
      return { exitCode: 1, signal: null, timedOut: false, errorCode: "dsh_ssh_final_missing", errorMessage: "DSH runner completed without a final event." };
    }
    if (observed.aborted && !TERMINAL_STATES.has(observed.state)) {
      return { exitCode: 1, signal: "SIGTERM", timedOut: false, errorCode: "dsh_ssh_cleanup_pending", errorMessage: "DSH runner cancellation did not settle." };
    }
    return resultForState(ctx.runId, observed.state, observed.finalText, observed.receipt);
  } catch {
    if (startAttempted) {
      return settleCancellation(
        resolved,
        ctx.runId,
        taskIssueId,
        "DSH runner transport failed after dispatch; remote cleanup could not be verified.",
      );
    }
    return { exitCode: 1, signal: null, timedOut: false, errorCode: "dsh_ssh_transport_failed", errorMessage: "DSH runner transport failed." };
  }
}

export const shellQuoteForTest = shellQuote;
