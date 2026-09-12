import { describe, expect, test } from "vitest";
import type { AdapterExecutionContext } from "@paperclipai/adapter-utils";
import { execute, resolveConfig, setSshTransportForTest, setTimingForTest } from "./execute.js";

const secret = "private-secret-material";
const task = "# Server authored task\nDo the work.";

function context(signal?: AbortSignal): AdapterExecutionContext {
  return {
    runId: "run-1",
    signal,
    agent: { id: "agent-1", companyId: "company-1", name: "Agent", adapterType: "dsh_ssh", adapterConfig: {} },
    runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
    config: {
      labOnly: true, host: "lab.example", port: 2222, username: "lab",
      labStateRoot: "/private/state", principal: "owner", privateKey: secret, knownHosts: "lab.example ssh-ed25519 AAAA", strictHostKeyChecking: true,
      timeoutMs: 100, synthetic: true, mode: "finish",
    },
    context: { paperclipTaskMarkdown: task, paperclipIssue: { id: "issue-1" } },
    authToken: "run-jwt-sentinel",
    onLog: async () => undefined,
  };
}

describe("dsh SSH execution", () => {
  test("validates absolute lab paths and strict host identity", () => {
    const base = context().config;
    expect(resolveConfig(base)).not.toBeTypeOf("string");
    expect(resolveConfig({ ...base, runnerCommand: "/tmp/untrusted.py" })).toMatch("does not accept");
    expect(resolveConfig({ ...base, labStateRoot: "relative" })).toMatch("absolute path");
    expect(resolveConfig({ ...base, mode: "finish", synthetic: false })).toMatch("requires synthetic");
    expect(resolveConfig({ ...base, mode: undefined, synthetic: true })).toMatch("explicit");
    expect(resolveConfig({ ...base, strictHostKeyChecking: false })).toMatch("requires strict host-key checking");
  });

  test("requires the dedicated private key", () => {
    const base = context().config;
    expect(resolveConfig({ ...base, privateKey: undefined })).toMatch("privateKey");
  });

  test("uses stdin for exact requests, never task in command, and maps a final event", async () => {
    const calls: Array<{ command: string; stdin?: string; env?: Record<string, string> }> = [];
    let eventRead = 0;
    setSshTransportForTest(async (_config, command, options) => {
      calls.push({ command, stdin: options.stdin, env: options.env });
      const request = JSON.parse(options.stdin ?? "{}");
      if (request.op === "events") {
        eventRead += 1;
        return { stdout: JSON.stringify({ events: eventRead === 1 ? [
          { seq: 1, type: "final", data: { text: "finished" } },
          { seq: 2, type: "receipt", data: { kind: "issue_disposition", issueId: "issue-1", status: "done", runId: "run-1", commentId: "comment-1", verifiedAt: "2026-09-12T03:00:00.000Z" } },
        ] : [] }), stderr: "" };
      }
      if (request.op === "status") return { stdout: JSON.stringify({ runId: "run-1", state: "completed" }), stderr: "" };
      return { stdout: JSON.stringify({ runId: "run-1", state: "accepted" }), stderr: "" };
    });
    try {
      const result = await execute(context());
      expect(result).toMatchObject({
        exitCode: 0,
        resultJson: {
          finalResponse: { final: true, text: "finished" },
          runnerRunId: "run-1",
          runnerState: "completed",
        },
      });
      expect(calls.every((call) => call.command === "/home/quancoo/[Hermes]-DSH-Paperclip-draft-2/[Hermes]-supervisor-draft-2-synthetic.py")).toBe(true);
      expect(calls.every((call) => !call.command.includes(task) && !call.command.includes(secret))).toBe(true);
      expect(JSON.parse(calls[0]?.stdin ?? "{}").payload.task).toContain(task);
      expect(JSON.parse(calls[0]?.stdin ?? "{}").payload.task).toContain("clear final disposition");
      expect(calls[0]?.env).toEqual({ PAPERCLIP_PRINCIPAL: "owner", PAPERCLIP_LAB_STATE: "/private/state", PAPERCLIP_PROFILE_PLUGIN: "synthetic" });
      expect(JSON.parse(calls[0]?.stdin ?? "{}").authToken).toBe("run-jwt-sentinel");
      expect(calls.slice(1).every((call) => !String(call.stdin).includes("run-jwt-sentinel"))).toBe(true);
    } finally {
      setSshTransportForTest(null);
    }
  });

  test("rejects a receipt for a different issue", async () => {
    setSshTransportForTest(async (_config, _command, options) => {
      const request = JSON.parse(options.stdin ?? "{}");
      if (request.op === "events") {
        return { stdout: JSON.stringify({ events: [
          { seq: 1, type: "final", data: { text: "finished" } },
          { seq: 2, type: "receipt", data: { kind: "issue_disposition", issueId: "other-issue", status: "done", runId: "run-1", commentId: "comment-1", verifiedAt: "2026-09-12T03:00:00.000Z" } },
        ] }), stderr: "" };
      }
      if (request.op === "status") return { stdout: JSON.stringify({ runId: "run-1", state: "completed" }), stderr: "" };
      return { stdout: JSON.stringify({ runId: "run-1", state: "accepted" }), stderr: "" };
    });
    try {
      await expect(execute(context())).resolves.toMatchObject({ exitCode: 1 });
    } finally {
      setSshTransportForTest(null);
    }
  });

  test("pins the real runner when synthetic mode is absent", () => {
    const resolved = resolveConfig({ ...context().config, mode: undefined, synthetic: false });
    expect(resolved).not.toBeTypeOf("string");
    expect(typeof resolved === "string" ? null : resolved.runnerCommand).toBe("/home/quancoo/[Hermes]-DSH-Paperclip-draft-2/[Hermes]-supervisor-draft-2.py");
  });

  test("rejects runner, executable, and Paperclip API URL overrides", () => {
    const base = context().config;
    expect(resolveConfig({ ...base, runnerCommand: "/tmp/untrusted-synthetic.py" })).toMatch("does not accept");
    expect(resolveConfig({ ...base, nodeCommand: "/tmp/node" })).toMatch("does not accept");
    expect(resolveConfig({ ...base, paperclipApiUrl: "https://collector.example" })).toMatch("does not accept");
  });

  test("sends cancel then waits for terminal settlement", async () => {
    const controller = new AbortController();
    const ops: string[] = [];
    setSshTransportForTest(async (_config, _command, options) => {
      const request = JSON.parse(options.stdin ?? "{}");
      ops.push(request.op);
      if (request.op === "start") controller.abort();
      if (request.op === "cancel") return { stdout: JSON.stringify({ runId: "run-1", state: "running" }), stderr: "" };
      if (request.op === "events") return { stdout: JSON.stringify({ events: [] }), stderr: "" };
      return { stdout: JSON.stringify({ runId: "run-1", state: request.op === "status" && ops.includes("cancel") ? "cancelled" : "accepted" }), stderr: "" };
    });
    try {
      const result = await execute(context(controller.signal));
      expect(ops).toContain("cancel");
      expect(result).toMatchObject({ signal: "SIGTERM", errorCode: "dsh_ssh_cancelled" });
    } finally {
      setSshTransportForTest(null);
    }
  });

  test("fails completed state without final event", async () => {
    setSshTransportForTest(async (_config, _command, options) => {
      const request = JSON.parse(options.stdin ?? "{}");
      if (request.op === "events") return { stdout: JSON.stringify({ events: [] }), stderr: "" };
      return { stdout: JSON.stringify({ runId: "run-1", state: request.op === "status" ? "completed" : "accepted" }), stderr: "" };
    });
    try {
      await expect(execute(context())).resolves.toMatchObject({ errorCode: "dsh_ssh_final_missing" });
    } finally {
      setSshTransportForTest(null);
    }
  });

  test("rejects oversized server-authored task instead of truncating it", async () => {
    const oversized = context();
    oversized.context = { paperclipTaskMarkdown: "x".repeat(10_001) };
    await expect(execute(oversized)).resolves.toMatchObject({ errorCode: "dsh_ssh_config_invalid" });
  });

  test("returns cleanup pending when timeout cancellation cannot settle", async () => {
    const ops: string[] = [];
    setTimingForTest({ pollIntervalMs: 1, settleMs: 10 });
    setSshTransportForTest(async (_config, _command, options) => {
      const request = JSON.parse(options.stdin ?? "{}");
      ops.push(request.op);
      if (request.op === "events") return { stdout: JSON.stringify({ events: [] }), stderr: "" };
      return { stdout: JSON.stringify({ runId: "run-1", state: "running" }), stderr: "" };
    });
    try {
      const result = await execute(context());
      expect(ops).toContain("cancel");
      expect(result).toMatchObject({ timedOut: false, errorCode: "dsh_ssh_cleanup_pending" });
    } finally {
      setSshTransportForTest(null);
      setTimingForTest(null);
    }
  });


  test("attempts containment when the start response is lost", async () => {
    const ops: string[] = [];
    setTimingForTest({ pollIntervalMs: 1, settleMs: 10 });
    setSshTransportForTest(async (_config, _command, options) => {
      const request = JSON.parse(options.stdin ?? "{}");
      ops.push(request.op);
      if (request.op === "start") throw new Error("lost response");
      if (request.op === "cancel") return { stdout: JSON.stringify({ runId: "run-1", state: "running" }), stderr: "" };
      if (request.op === "events") return { stdout: JSON.stringify({ events: [] }), stderr: "" };
      return { stdout: JSON.stringify({ runId: "run-1", state: "running" }), stderr: "" };
    });
    try {
      const result = await execute(context());
      expect(ops).toContain("cancel");
      expect(result).toMatchObject({ errorCode: "dsh_ssh_cleanup_pending" });
    } finally {
      setSshTransportForTest(null);
      setTimingForTest(null);
    }
  });

  test("attempts containment when observation exhausts the deadline", async () => {
    const ops: string[] = [];
    setTimingForTest({ pollIntervalMs: 1, settleMs: 10 });
    setSshTransportForTest(async (_config, _command, options) => {
      const request = JSON.parse(options.stdin ?? "{}");
      ops.push(request.op);
      if (request.op === "start") return { stdout: JSON.stringify({ runId: "run-1", state: "running" }), stderr: "" };
      if (request.op === "events") throw new Error("deadline exhausted");
      if (request.op === "cancel") return { stdout: JSON.stringify({ runId: "run-1", state: "running" }), stderr: "" };
      return { stdout: JSON.stringify({ runId: "run-1", state: "running" }), stderr: "" };
    });
    try {
      const result = await execute(context());
      expect(ops).toContain("cancel");
      expect(result).toMatchObject({ errorCode: "dsh_ssh_cleanup_pending" });
    } finally {
      setSshTransportForTest(null);
      setTimingForTest(null);
    }
  });

  test("caps every SSH attempt by the remaining adapter deadline", async () => {
    const transportTimeouts: number[] = [];
    setTimingForTest({ pollIntervalMs: 1, settleMs: 20 });
    setSshTransportForTest(async (_config, _command, options) => {
      transportTimeouts.push(options.timeoutMs ?? 0);
      const request = JSON.parse(options.stdin ?? "{}");
      if (request.op === "events") return { stdout: JSON.stringify({ events: [] }), stderr: "" };
      return { stdout: JSON.stringify({ runId: "run-1", state: "completed" }), stderr: "" };
    });
    try {
      await execute(context());
      expect(transportTimeouts.every((timeout) => timeout > 0 && timeout <= 120)).toBe(true);
    } finally {
      setSshTransportForTest(null);
      setTimingForTest(null);
    }
  });
});
