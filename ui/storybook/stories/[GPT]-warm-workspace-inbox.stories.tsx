import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { useQueryClient } from "@tanstack/react-query";
import { Inbox } from "@/pages/Inbox";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";
import { useCompany } from "@/context/CompanyContext";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Issue, IssueBlockedInboxAttention } from "@paperclipai/shared";
import type { InboxTab } from "@/lib/inbox";
import {
  storybookApprovals,
  storybookAgents,
  storybookProjects,
  storybookAuthSession,
  storybookCompanies,
  storybookDashboardSummary,
  storybookIssues,
} from "../fixtures/paperclipData";

/**
 * Full-shell preview of the real Inbox route: mounts the actual `Inbox`
 * component (which itself owns the StreamlinedInbox/LegacyInbox switch)
 * inside the real Layout/Layout.production shell, on the real `/inbox/:tab`
 * route — mirrors `TaskDetailScenario` in `[GPT]-warm-workspace.stories.tsx`.
 *
 * `streamlined` drives both axes at once (Layout choice + Inbox's internal
 * mode) because both read the same `enableStreamlinedUi` experimental flag.
 */
const INBOX_COMPANY = storybookCompanies[0]!; // issuePrefix "PAP"
const INBOX_COMPANY_ID = INBOX_COMPANY.id;

const INBOX_FIXTURE_ISSUES = storybookIssues.filter(
  (issue) => issue.companyId === INBOX_COMPANY_ID,
);
const INBOX_FIXTURE_APPROVALS = storybookApprovals.filter(
  (approval) => approval.companyId === INBOX_COMPANY_ID,
);

// `storybookIssues` carry no `blockedInboxAttention` — the blocked tab
// (BlockedInboxView) only renders a row when that field is present, so the
// blocked-tab stories attach it the same way blocked-inbox.stories.tsx does.
function blockedAttention(
  overrides: Partial<IssueBlockedInboxAttention> = {},
): IssueBlockedInboxAttention {
  return {
    kind: "blocked",
    state: "needs_attention",
    reason: "blocked_chain_stalled",
    severity: "medium",
    stoppedSinceAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    owner: { type: "agent", agentId: null, userId: null, label: "ClaudeCoder" },
    action: { label: "Resolve blocker", detail: null },
    sourceIssue: null,
    leafIssue: null,
    recoveryIssue: null,
    approvalId: null,
    interactionId: null,
    sampleIssueIdentifier: null,
    redaction: { externalDetailsRedacted: false, secretFieldsOmitted: true },
    ...overrides,
  };
}
const INBOX_FIXTURE_BLOCKED_ISSUES: Issue[] = INBOX_FIXTURE_ISSUES
  .filter((issue) => issue.status === "blocked")
  .map((issue) => ({ ...issue, blockedInboxAttention: blockedAttention() }));

type InboxState = "populated" | "empty" | "loading" | "error";

function InboxScenario({
  streamlined = true,
  tab = "mine",
  state = "populated",
}: {
  streamlined?: boolean;
  tab?: InboxTab;
  state?: InboxState;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompanyId, setSelectedCompanyId } = useCompany();
  const [ready, setReady] = useState(false);
  const [initialPath] = useState(location.pathname);
  const target = `/${INBOX_COMPANY.issuePrefix}/inbox/${tab}`;

  useEffect(() => {
    const originalFetch = window.fetch;
    const settingsKey = queryKeys.instance.experimentalSettings;
    const previousSettings = queryClient.getQueryData(settingsKey);
    queryClient.setQueryData(settingsKey, { enableStreamlinedUi: streamlined });

    // Preview navigation is one-way onto the inbox tab route; local tab
    // clicks then own the URL from there via Inbox's own `navigate`.
    window.fetch = async (input, init) => {
      const rawUrl =
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(rawUrl, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

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
      if (url.pathname === "/api/auth/get-session") {
        return Response.json(storybookAuthSession);
      }

      const companyMatch = url.pathname.match(
        new RegExp(`^/api/companies/${INBOX_COMPANY_ID}/([^/?]+)$`),
      );
      if (companyMatch) {
        const resource = companyMatch[1];

        if (resource === "issues") {
          const attention = url.searchParams.get("attention");
          if (state === "loading") return new Promise<Response>(() => {});
          if (state === "error") return Response.json({ error: "Sample inbox could not be loaded." }, { status: 503 });
          if (state === "empty") return Response.json([]);
          let issues = attention === "blocked" ? INBOX_FIXTURE_BLOCKED_ISSUES : INBOX_FIXTURE_ISSUES;
          const query = url.searchParams.get("q")?.toLowerCase();
          const statuses = url.searchParams.get("status")?.split(",");
          if (query) issues = issues.filter((issue) => `${issue.title} ${issue.identifier}`.toLowerCase().includes(query));
          if (statuses) issues = issues.filter((issue) => statuses.includes(issue.status));
          return Response.json(issues);
        }
        if (resource === "labels") return Response.json([]);
        if (resource === "agents") return Response.json(storybookAgents);
        if (resource === "projects") return Response.json(storybookProjects);
        if (resource === "approvals") {
          if (state === "loading") return new Promise<Response>(() => {});
          if (state === "error") {
            return Response.json({ error: "Sample approvals could not be loaded." }, { status: 503 });
          }
          if (state === "empty") return Response.json([]);
          return Response.json(INBOX_FIXTURE_APPROVALS);
        }
        if (resource === "dashboard") {
          return Response.json({ ...storybookDashboardSummary, companyId: INBOX_COMPANY_ID });
        }
        if (resource === "heartbeat-runs") return Response.json([]);
        if (resource === "live-runs") return Response.json([]);
        if (resource === "join-requests") return Response.json([]);
        if (resource === "user-directory") return Response.json({ users: [] });
      }

      if (companyMatch) {
        return Response.json({ error: "No fixture for this inbox endpoint." }, { status: 501 });
      }
      // Anything else (companies list, sidebar-badges, etc.) falls through to
      // the global preview.tsx fixture layer, mirroring TaskDetailScenario.
      return originalFetch(input, init);
    };

    setReady(true);
    return () => {
      window.fetch = originalFetch;
      queryClient.removeQueries({
        predicate: ({ queryKey }) => queryKey.some((part) => part === INBOX_COMPANY_ID),
      });
      if (previousSettings === undefined) {
        queryClient.removeQueries({ queryKey: settingsKey, exact: true });
      } else {
        queryClient.setQueryData(settingsKey, previousSettings);
      }
    };
  }, [queryClient, state, streamlined, tab]);

  useEffect(() => {
    if (selectedCompanyId !== INBOX_COMPANY_ID) setSelectedCompanyId(INBOX_COMPANY_ID);
  }, [selectedCompanyId, setSelectedCompanyId]);
  useEffect(() => {
    if (location.pathname === initialPath && initialPath !== target) navigate(target, { replace: true });
  }, [initialPath, location.pathname, navigate, target]);

  if (!ready || selectedCompanyId !== INBOX_COMPANY_ID) return null;
  return (
    <PluginLauncherProvider>
      <Routes>
        <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
          <Route path="inbox/:tab" element={<Inbox />} />
          <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
        </Route>
      </Routes>
    </PluginLauncherProvider>
  );
}

const meta = {
  title: "Pages/Warm Workspace/Inbox",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Read-only sample data for design verification; not live E2E.",
      },
    },
  },
} satisfies Meta<typeof InboxScenario>;
export default meta;

export const StreamlinedMine: StoryObj = {
  render: () => <InboxScenario streamlined tab="mine" />,
};
export const StreamlinedRecent: StoryObj = {
  render: () => <InboxScenario streamlined tab="recent" />,
};
export const StreamlinedUnread: StoryObj = {
  render: () => <InboxScenario streamlined tab="unread" />,
};
export const StreamlinedBlocked: StoryObj = {
  render: () => <InboxScenario streamlined tab="blocked" />,
};
export const StreamlinedAll: StoryObj = {
  render: () => <InboxScenario streamlined tab="all" />,
};

export const LegacyMine: StoryObj = {
  render: () => <InboxScenario streamlined={false} tab="mine" />,
};
export const LegacyBlocked: StoryObj = {
  render: () => <InboxScenario streamlined={false} tab="blocked" />,
};
export const LegacyAll: StoryObj = {
  render: () => <InboxScenario streamlined={false} tab="all" />,
};

export const Empty: StoryObj = {
  render: () => <InboxScenario streamlined tab="mine" state="empty" />,
};
export const Loading: StoryObj = {
  render: () => <InboxScenario streamlined tab="mine" state="loading" />,
};
export const BlockedError: StoryObj = {
  render: () => <InboxScenario streamlined tab="blocked" state="error" />,
};
