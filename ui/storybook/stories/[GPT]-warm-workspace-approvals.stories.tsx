import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { useQueryClient } from "@tanstack/react-query";
import { Approvals } from "@/pages/Approvals";
import { ApprovalDetail } from "@/pages/ApprovalDetail";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";
import { storybookApprovals, storybookAgents, storybookIssues } from "../fixtures/paperclipData";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCompany } from "@/context/CompanyContext";
import type { ApprovalComment } from "@paperclipai/shared";

/**
 * Real Approvals + ApprovalDetail pages, mounted the same way as the Task
 * Detail and Goals full shells (`[GPT]-warm-workspace.stories.tsx`
 * `TaskDetailScenario`, `[GPT]-warm-workspace-goals.stories.tsx`
 * `GoalsScenario`): seed a fetch stub scoped to the approvals endpoints,
 * navigate onto the canonical `/PAP/approvals(/:approvalId)` route, and let
 * the page own the URL afterwards so the list -> detail -> back flow is real
 * in-app navigation, not disconnected component demos.
 */

const APPROVALS_COMPANY_ID = "company-storybook";
// Pending hire_agent approval with no linked issues — exercises the
// Approve/Reject actionable state and the "Open hired agent" resolved CTA.
const APPROVAL_DETAIL_ACTIONABLE_ID = "approval-hire-designer";
// Revision-requested budget_override_required approval with a decision note
// and a linked task — exercises the non-actionable budget CTA branch and the
// Linked Tasks section.
const APPROVAL_DETAIL_LINKED_ID = "approval-budget";

const APPROVAL_COMMENTS: Record<string, ApprovalComment[]> = {
  [APPROVAL_DETAIL_ACTIONABLE_ID]: [
    {
      id: "approval-comment-1",
      companyId: APPROVALS_COMPANY_ID,
      approvalId: APPROVAL_DETAIL_ACTIONABLE_ID,
      authorAgentId: "agent-cto",
      authorUserId: null,
      body: "Requesting board sign-off to hire a dedicated design-system engineer before the next release.",
      createdAt: new Date("2026-04-20T10:40:00.000Z"),
      updatedAt: new Date("2026-04-20T10:40:00.000Z"),
    },
  ],
  [APPROVAL_DETAIL_LINKED_ID]: [
    {
      id: "approval-comment-2",
      companyId: APPROVALS_COMPANY_ID,
      approvalId: APPROVAL_DETAIL_LINKED_ID,
      authorAgentId: null,
      authorUserId: "user-board",
      body: "Need a tighter verification list before approving more spend.",
      createdAt: new Date("2026-04-20T11:48:00.000Z"),
      updatedAt: new Date("2026-04-20T11:48:00.000Z"),
    },
  ],
};

const APPROVAL_LINKED_ISSUES: Record<string, typeof storybookIssues> = {
  [APPROVAL_DETAIL_LINKED_ID]: storybookIssues.filter((issue) => issue.id === "issue-storybook-7"),
};

type ApprovalsScenarioState = "populated" | "empty" | "loading" | "error";

function ApprovalsScenario({
  streamlined = true,
  entry = "list",
  detailId = APPROVAL_DETAIL_ACTIONABLE_ID,
  state = "populated",
}: {
  streamlined?: boolean;
  entry?: "list" | "detail";
  detailId?: string;
  state?: ApprovalsScenarioState;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompanyId, setSelectedCompanyId } = useCompany();
  const [ready, setReady] = useState(false);
  const [initialPath] = useState(location.pathname);

  const routePrefix = "/PAP/approvals";
  const target = entry === "list" ? `${routePrefix}/pending` : `${routePrefix}/${detailId}`;

  useEffect(() => {
    const originalFetch = window.fetch;
    const settingsKey = queryKeys.instance.experimentalSettings;
    const previousSettings = queryClient.getQueryData(settingsKey);
    queryClient.setQueryData(settingsKey, { enableStreamlinedUi: streamlined });

    window.fetch = async (input, init) => {
      const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(rawUrl, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

      // Read-only preview: any mutating call anywhere under /api fails closed
      // rather than reaching a real server (mirrors TaskDetailScenario /
      // GoalsScenario). Approve/Reject/comment buttons stay wired to the real
      // mutations, but they resolve into this 403 instead of a live action.
      if (url.pathname.startsWith("/api/") && method !== "GET") {
        return Response.json({ error: "This preview is read-only." }, { status: 403 });
      }

      if (url.pathname === "/api/health") {
        return Response.json({ status: "ok", deploymentMode: "local_trusted" });
      }
      if (url.pathname === "/api/instance/settings/general") {
        return Response.json({ keyboardShortcuts: true });
      }
      if (url.pathname === "/api/instance/settings/experimental") {
        return Response.json({ enableStreamlinedUi: streamlined });
      }

      if (url.pathname === `/api/companies/${APPROVALS_COMPANY_ID}/approvals`) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample approvals could not be loaded." }, { status: 503 });
        if (state === "empty") return Response.json([]);
        return Response.json(storybookApprovals);
      }
      if (url.pathname === `/api/companies/${APPROVALS_COMPANY_ID}/agents`) {
        return Response.json(storybookAgents);
      }

      const approvalDetailMatch = url.pathname.match(/^\/api\/approvals\/([^/]+)$/);
      if (approvalDetailMatch) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample approval could not be loaded." }, { status: 503 });
        const approval = storybookApprovals.find((a) => a.id === approvalDetailMatch[1]);
        return approval ? Response.json(approval) : Response.json({ error: "Approval not found." }, { status: 404 });
      }
      const approvalCommentsMatch = url.pathname.match(/^\/api\/approvals\/([^/]+)\/comments$/);
      if (approvalCommentsMatch) {
        if (state === "empty") return Response.json([]);
        return Response.json(APPROVAL_COMMENTS[approvalCommentsMatch[1]!] ?? []);
      }
      const approvalIssuesMatch = url.pathname.match(/^\/api\/approvals\/([^/]+)\/issues$/);
      if (approvalIssuesMatch) {
        if (state === "empty") return Response.json([]);
        return Response.json(APPROVAL_LINKED_ISSUES[approvalIssuesMatch[1]!] ?? []);
      }

      if (
        url.pathname.startsWith("/api/approvals") ||
        /^\/api\/companies\/[^/]+\/approvals(\/|$)/.test(url.pathname)
      ) {
        return Response.json({ error: "No fixture for this approval endpoint." }, { status: 501 });
      }

      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      queryClient.removeQueries({ predicate: ({ queryKey }) => queryKey[0] === "approvals" });
      if (previousSettings === undefined) {
        queryClient.removeQueries({ queryKey: settingsKey, exact: true });
      } else {
        queryClient.setQueryData(settingsKey, previousSettings);
      }
    };
  }, [detailId, queryClient, state, streamlined]);

  useEffect(() => {
    if (selectedCompanyId !== APPROVALS_COMPANY_ID) setSelectedCompanyId(APPROVALS_COMPANY_ID);
  }, [selectedCompanyId, setSelectedCompanyId]);
  useEffect(() => {
    // One-shot hop onto the approvals route, keyed off the path the story
    // mounted with (mirrors TaskDetailScenario's / GoalsScenario's
    // `initialPath`). Once the page has navigated onward — into a detail, or
    // back to the list — this must not fire again, or every in-app link out
    // of /approvals gets dragged back to `target` in a redirect loop.
    if (location.pathname === initialPath && initialPath !== target) navigate(target, { replace: true });
  }, [initialPath, location.pathname, navigate, target]);

  if (!ready || selectedCompanyId !== APPROVALS_COMPANY_ID) return null;

  return (
    <PluginLauncherProvider>
      <Routes>
        <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
          <Route path="approvals/pending" element={<Approvals />} />
          <Route path="approvals/all" element={<Approvals />} />
          <Route path="approvals/:approvalId" element={<ApprovalDetail />} />
          <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
        </Route>
      </Routes>
    </PluginLauncherProvider>
  );
}

const meta = {
  title: "Pages/Warm Workspace/Approvals",
  component: ApprovalsScenario,
  parameters: { layout: "fullscreen", a11y: { test: "off" } },
} satisfies Meta<typeof ApprovalsScenario>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ApprovalsListPopulated: Story = { render: () => <ApprovalsScenario entry="list" state="populated" /> };
export const ApprovalsListEmpty: Story = { render: () => <ApprovalsScenario entry="list" state="empty" /> };
export const ApprovalsListLoading: Story = { render: () => <ApprovalsScenario entry="list" state="loading" /> };
export const ApprovalsListError: Story = { render: () => <ApprovalsScenario entry="list" state="error" /> };
export const ApprovalsListProductionLayout: Story = {
  render: () => <ApprovalsScenario entry="list" state="populated" streamlined={false} />,
};

export const ApprovalDetailPopulated: Story = {
  render: () => <ApprovalsScenario entry="detail" detailId={APPROVAL_DETAIL_ACTIONABLE_ID} state="populated" />,
};
export const ApprovalDetailLinkedTask: Story = {
  render: () => <ApprovalsScenario entry="detail" detailId={APPROVAL_DETAIL_LINKED_ID} state="populated" />,
};
export const ApprovalDetailEmpty: Story = {
  render: () => <ApprovalsScenario entry="detail" detailId={APPROVAL_DETAIL_ACTIONABLE_ID} state="empty" />,
};
export const ApprovalDetailLoading: Story = {
  render: () => <ApprovalsScenario entry="detail" detailId={APPROVAL_DETAIL_ACTIONABLE_ID} state="loading" />,
};
export const ApprovalDetailError: Story = {
  render: () => <ApprovalsScenario entry="detail" detailId={APPROVAL_DETAIL_ACTIONABLE_ID} state="error" />,
};
export const ApprovalDetailProductionLayout: Story = {
  render: () => (
    <ApprovalsScenario entry="detail" detailId={APPROVAL_DETAIL_ACTIONABLE_ID} state="populated" streamlined={false} />
  ),
};
