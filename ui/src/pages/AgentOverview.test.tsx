// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AgentDetail, AgentRuntimeState, HeartbeatRun, Issue } from "@paperclipai/shared";
import { describe, expect, it, vi } from "vitest";
import { AgentOverview } from "./AgentDetail";

vi.mock("@/lib/router", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
      <a href={to} {...props}>{children}</a>
    ),
  };
});

vi.mock("../components/MarkdownBody", () => ({
  MarkdownBody: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("AgentOverview", () => {
  it("prioritizes recent work while retaining agent information and scoped Audit links", () => {
    const agent = {
      id: "agent-1",
      companyId: "company-1",
      name: "Codex Coder",
      urlKey: "codexcoder",
      role: "engineer",
      title: "LongUnbrokenAgentTitle".repeat(8),
      status: "active",
      reportsTo: null,
      capabilities: "Builds and verifies product changes.",
      adapterType: "codex_local",
      adapterConfig: { model: "gpt-5.6-sol" },
      runtimeConfig: {},
      chainOfCommand: [],
      access: { canAssignTasks: true, taskAssignSource: "explicit_grant", membership: null, grants: [] },
    } as unknown as AgentDetail;
    const issue = {
      id: "issue-1",
      companyId: "company-1",
      identifier: "PAP-42",
      title: "Simplify agent information architecture",
      status: "in_progress",
      priority: "high",
      updatedAt: new Date("2026-08-31T12:00:00Z"),
    } as unknown as Issue;
    const runtime = {
      sessionDisplayId: "codex-session-42",
    } as unknown as AgentRuntimeState;

    const longSkillName = "LongUnbrokenSkillName".repeat(7);
    const markup = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <AgentOverview
          agent={agent}
          runs={[] as HeartbeatRun[]}
          assignedIssues={[issue]}
          runtimeState={runtime}
          directReportCount={2}
          skillNames={["Design Guide", "Check PR", longSkillName]}
          agentRouteId="codexcoder"
        />
      </QueryClientProvider>,
    );

    const document = new DOMParser().parseFromString(markup, "text/html");
    const tasks = document.querySelector('[aria-labelledby="agent-recent-tasks-heading"]')!;
    const information = document.querySelector('aside[aria-label="Agent information"]')!;
    expect(tasks.compareDocumentPosition(information) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(information.contains(tasks)).toBe(false);
    expect(information.textContent).toContain("codex-session-42");
    expect(information.textContent).toContain(agent.title);
    expect(information.textContent).toContain(longSkillName);
    expect(information.querySelector('a[href="/agents/codexcoder/runtime"]')).not.toBeNull();
    expect(information.querySelector('a[href="/agents/codexcoder/skills"]')).not.toBeNull();
    expect(markup).toContain("Identity");
    expect(markup).toContain("Capabilities");
    expect(markup).toContain("Harness / Runtime");
    expect(markup).toContain("Design Guide");
    expect(markup).toContain("Simplify agent information architecture");
    expect(markup).toContain("PAP-42");
    expect(markup).toContain('href="/activity/costs?agentId=agent-1"');
    expect(markup).not.toContain("Run Activity");
    expect(markup).not.toContain("Tasks by Status");
  });
});
