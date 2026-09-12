export const PROTOCOL = "dsh-paperclip-runner/draft-2";

const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const FINAL_DISPOSITIONS = new Set(["done", "in_review", "blocked"]);
const STATES = new Set([
  "accepted",
  "running",
  "cleanup_pending",
  "completed",
  "cancelled",
  "timed_out",
  "failed",
]);
const ERRORS = new Set([
  "invalid_identifier",
  "invalid_schema",
  "invalid_payload",
  "ownership_mismatch",
  "payload_collision",
  "not_found",
  "invalid_cursor",
  "request_too_large",
  "invalid_request",
]);

export type RunnerState = "accepted" | "running" | "cleanup_pending" | "completed" | "cancelled" | "timed_out" | "failed";
export type PaperclipDispositionReceipt = {
  kind: "issue_disposition";
  issueId: string;
  status: "done" | "in_review" | "blocked";
  runId: string;
  commentId: string;
  verifiedAt: string;
};
export type RunnerEvent =
  | { seq: number; type: "accepted"; data: { disconnectPolicy: "continue" } }
  | { seq: number; type: "state"; data: { state: RunnerState } }
  | { seq: number; type: "final"; data: { text: string } }
  | { seq: number; type: "receipt"; data: PaperclipDispositionReceipt };
export type RunnerResponse =
  | { kind: "state"; runId: string; state: RunnerState }
  | { kind: "events"; events: RunnerEvent[] }
  | { kind: "error"; error: string };

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER.test(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function codePoints(value: string): number {
  return Array.from(value).length;
}

function parseEvent(value: unknown): RunnerEvent | null {
  const event = record(value);
  if (!event || !hasExactKeys(event, ["seq", "type", "data"]) || !isInteger(event.seq) || event.seq < 1) return null;
  const data = record(event.data);
  if (!data || typeof event.type !== "string") return null;
  if (event.type === "accepted" && hasExactKeys(data, ["disconnectPolicy"]) && data.disconnectPolicy === "continue") {
    return { seq: event.seq, type: "accepted", data: { disconnectPolicy: "continue" } };
  }
  if (event.type === "state" && hasExactKeys(data, ["state"]) && typeof data.state === "string" && STATES.has(data.state)) {
    return { seq: event.seq, type: "state", data: { state: data.state as RunnerState } };
  }
  if (event.type === "final" && hasExactKeys(data, ["text"]) && typeof data.text === "string") {
    return { seq: event.seq, type: "final", data: { text: data.text } };
  }
  if (
    event.type === "receipt" &&
    hasExactKeys(data, ["kind", "issueId", "status", "runId", "commentId", "verifiedAt"]) &&
    data.kind === "issue_disposition" &&
    isIdentifier(data.issueId) &&
    typeof data.status === "string" &&
    FINAL_DISPOSITIONS.has(data.status) &&
    isIdentifier(data.runId) &&
    isIdentifier(data.commentId) &&
    typeof data.verifiedAt === "string" &&
    data.verifiedAt.length <= 64 &&
    !Number.isNaN(Date.parse(data.verifiedAt))
  ) {
    return {
      seq: event.seq,
      type: "receipt",
      data: data as PaperclipDispositionReceipt,
    };
  }
  return null;
}

export function buildRequest(input: {
  op: "start" | "status" | "events" | "cancel";
  runId: string;
  owner: string;
  task?: string;
  timeoutMs?: number;
  after?: number;
  mode?: "finish" | "hang";
  authToken?: string;
  agentId?: string;
  companyId?: string;
  issueId?: string;
}): Record<string, unknown> {
  if (
    input.op !== "start" &&
    input.op !== "status" &&
    input.op !== "events" &&
    input.op !== "cancel"
  ) {
    throw new Error("Invalid runner operation.");
  }
  if (!isIdentifier(input.runId) || !isIdentifier(input.owner)) throw new Error("Invalid runner identifier.");
  const base = { protocol: PROTOCOL, op: input.op, runId: input.runId, owner: input.owner };
  if (input.op === "start") {
    if (typeof input.task !== "string" || codePoints(input.task) < 1 || codePoints(input.task) > 10_000) {
      throw new Error("Invalid runner task.");
    }
    if (!isInteger(input.timeoutMs) || input.timeoutMs < 100 || input.timeoutMs > 3_600_000) {
      throw new Error("Invalid runner timeout.");
    }
    if (typeof input.authToken !== "string" || input.authToken.length < 1 || input.authToken.length > 16_384) {
      throw new Error("Invalid runner auth token.");
    }
    if (!isIdentifier(input.agentId) || !isIdentifier(input.companyId) || !isIdentifier(input.issueId)) {
      throw new Error("Invalid runner Paperclip identity.");
    }
    if (input.mode !== undefined && input.mode !== "finish" && input.mode !== "hang") throw new Error("Invalid runner mode.");
    return {
      ...base,
      authToken: input.authToken,
      agentId: input.agentId,
      companyId: input.companyId,
      issueId: input.issueId,
      payload: {
        task: input.task,
        timeoutMs: input.timeoutMs,
        disconnectPolicy: "continue",
        ...(input.mode ? { mode: input.mode } : {}),
      },
    };
  }
  if (input.op === "events") {
    if (!isInteger(input.after) || input.after < 0) throw new Error("Invalid runner cursor.");
    return { ...base, after: input.after };
  }
  return base;
}

export function encodeRequest(request: Record<string, unknown>): string {
  const json = JSON.stringify(request);
  if (Buffer.byteLength(json, "utf8") > 65_536) throw new Error("Runner request exceeds 65536 UTF-8 bytes.");
  return json;
}

export function parseResponse(
  value: unknown,
  expected: "state" | "events",
  options: { after?: number; runId?: string } = {},
): RunnerResponse | null {
  const response = record(value);
  if (!response) return null;
  if (hasExactKeys(response, ["error"]) && typeof response.error === "string" && ERRORS.has(response.error)) {
    return { kind: "error", error: response.error };
  }
  if (
    expected === "state" &&
    hasExactKeys(response, ["runId", "state"]) &&
    isIdentifier(response.runId) &&
    (options.runId === undefined || response.runId === options.runId) &&
    typeof response.state === "string" &&
    STATES.has(response.state)
  ) {
    return { kind: "state", runId: response.runId, state: response.state as RunnerState };
  }
  if (expected === "events" && hasExactKeys(response, ["events"]) && Array.isArray(response.events)) {
    const events = response.events.map(parseEvent);
    if (events.some((event) => event === null)) return null;
    const parsed = events as RunnerEvent[];
    if (
      parsed.some(
        (event, index) =>
          event.seq <= (options.after ?? 0) ||
          (index > 0 && event.seq <= parsed[index - 1]!.seq),
      )
    ) {
      return null;
    }
    return { kind: "events", events: parsed };
  }
  return null;
}
