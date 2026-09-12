import { describe, expect, test } from "vitest";
import { buildRequest, encodeRequest, parseResponse, PROTOCOL } from "./protocol.js";

const authToken = "jwt-sentinel";

function receipt(runId = "run-1") {
  return {
    seq: 2,
    type: "receipt",
    data: {
      kind: "issue_disposition",
      issueId: "issue-1",
      status: "done",
      runId,
      commentId: "comment-1",
      verifiedAt: "2026-09-12T03:00:00.000Z",
    },
  };
}

describe("dsh runner protocol", () => {
  test("builds exact draft-2 requests", () => {
    expect(buildRequest({ op: "start", runId: "run-1", owner: "owner", task: "synthetic", timeoutMs: 60_000, authToken, agentId: "agent-1", companyId: "company-1", issueId: "issue-1" })).toEqual({
      protocol: PROTOCOL,
      op: "start",
      runId: "run-1",
      owner: "owner",
      authToken,
      agentId: "agent-1",
      companyId: "company-1",
      issueId: "issue-1",
      payload: { task: "synthetic", timeoutMs: 60_000, disconnectPolicy: "continue" },
    });
    expect(buildRequest({ op: "status", runId: "run-1", owner: "owner" })).toEqual({
      protocol: PROTOCOL,
      op: "status",
      runId: "run-1",
      owner: "owner",
    });
    expect(buildRequest({ op: "events", runId: "run-1", owner: "owner", after: 0 })).toEqual({
      protocol: PROTOCOL,
      op: "events",
      runId: "run-1",
      owner: "owner",
      after: 0,
    });
    expect(buildRequest({ op: "cancel", runId: "run-1", owner: "owner" })).toEqual({
      protocol: PROTOCOL,
      op: "cancel",
      runId: "run-1",
      owner: "owner",
    });
  });

  test("rejects missing auth, invalid bounds, operations, and overlarge UTF-8 requests", () => {
    expect(() => buildRequest({ op: "start", runId: "run-1", owner: "owner", task: "x", timeoutMs: 99, authToken, agentId: "agent-1", companyId: "company-1", issueId: "issue-1" })).toThrow();
    expect(() => buildRequest({ op: "start", runId: "run-1", owner: "owner", task: "x", timeoutMs: 60_000, agentId: "agent-1", companyId: "company-1", issueId: "issue-1" })).toThrow("auth token");
    expect(() => buildRequest({ op: "start", runId: "run-1", owner: "owner", task: "x", timeoutMs: 3_600_001, authToken, agentId: "agent-1", companyId: "company-1", issueId: "issue-1" })).toThrow();
    expect(() => buildRequest({ op: "events", runId: "run-1", owner: "owner", after: -1 })).toThrow();
    expect(() => buildRequest({ op: "unknown" as never, runId: "run-1", owner: "owner" })).toThrow();
    expect(() => encodeRequest({ task: "é".repeat(40_000) })).toThrow("65536");
  });

  test("accepts only exact response envelopes bound to the requested run", () => {
    expect(parseResponse({ runId: "run-1", state: "accepted" }, "state", { runId: "run-1" })).toEqual({ kind: "state", runId: "run-1", state: "accepted" });
    expect(parseResponse({ runId: "old-run", state: "completed" }, "state", { runId: "run-1" })).toBeNull();
    expect(parseResponse({ runId: "run-1", state: "accepted", extra: true }, "state", { runId: "run-1" })).toBeNull();
  });

  test("parses bounded disposition receipts and advancing event cursors", () => {
    expect(parseResponse({ events: [{ seq: 1, type: "final", data: { text: "done" } }, receipt()] }, "events", { after: 0 })).toEqual({
      kind: "events",
      events: [{ seq: 1, type: "final", data: { text: "done" } }, receipt()],
    });
    expect(parseResponse({ events: [receipt("old-run")] }, "events", { after: 1 })).not.toBeNull();
    expect(parseResponse({ events: [{ ...receipt(), data: { ...receipt().data, status: "in_progress" } }] }, "events", { after: 1 })).toBeNull();
    expect(parseResponse({ events: [{ ...receipt(), data: { ...receipt().data, extra: true } }] }, "events", { after: 1 })).toBeNull();
    expect(parseResponse({ events: [{ seq: 1, type: "final", data: { text: "stale" } }] }, "events", { after: 1 })).toBeNull();
  });
});
