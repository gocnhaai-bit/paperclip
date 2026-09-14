import type {
  AuditActionRecord,
  AuditActionsResponse,
} from "@/api/audit";
import type {
  HeartbeatRun,
  BudgetOverview,
  CostByAgent,
  CostByAgentModel,
  CostByProject,
  CostSummary,
  CostByProviderModel,
  CostByBiller,
  CostWindowSpendRow,
  FinanceSummary,
  FinanceByBiller,
  FinanceByKind,
  FinanceEvent,
  ProviderQuotaResult,
} from "@paperclipai/shared";
import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";
import { useCompany } from "@/context/CompanyContext";
import { CompanyActivity } from "@/pages/audit/CompanyActivity";
import { CompanyActivity as ProductionCompanyActivity } from "@/pages/audit/CompanyActivity.production";
import { AuditHub } from "@/pages/audit/AuditHub";
import { Costs as ProductionCosts } from "@/pages/Costs.production";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Real full-shell Audit/Costs previews (streamlined + production layouts).
 *
 * Owners mounted here (see App.tsx routing):
 * - streamlined activity: `/:company/activity` → `CompanyActivity` → `AuditHub
 *   section="activity"` → `AuditFeed` (`@/pages/audit/AuditFeed`)
 * - production activity: `/:company/activity` (enableStreamlinedUi=false) →
 *   `CompanyActivity.production` → `AuditFeed.production`
 * - streamlined costs: `/:company/activity/costs` → `AuditHub section="costs"`
 *   → `<Costs embedded initialTab="overview" hideBudgetsTab />`
 * - production costs: `/:company/costs` → `Costs.production` (standalone)
 *
 * Scope: Activity, Costs, Runs and streamlined Budgets have read-only state previews.
 * Timeline reuses the global sample for a populated preview. Sibling navigation uses
 * actual AuditHub route owners without submitting budget changes.
 */

const AUDIT_COMPANY_ID = "company-storybook";

// ---------------------------------------------------------------------------
// Fixtures — typed sample data, not real production metrics.
// ---------------------------------------------------------------------------

const AUDIT_SAMPLE_DATE = new Date("2026-09-14T00:00:00Z");
const auditAt = (minutesAgo: number) => new Date(AUDIT_SAMPLE_DATE.getTime() - minutesAgo * 60_000).toISOString();

const AUDIT_RUNS: HeartbeatRun[] = (["succeeded", "failed"] as const).map((status, index) => ({
  id: `warm-audit-run-${index}`, companyId: AUDIT_COMPANY_ID, agentId: "agent-codex",
  invocationSource: "on_demand", triggerDetail: null, status, responsibleUserId: "user-board",
  startedAt: new Date("2026-09-14T00:00:00Z"), finishedAt: new Date("2026-09-14T00:01:00Z"),
  error: status === "failed" ? "Sample verification failed" : null, wakeupRequestId: null,
  exitCode: status === "failed" ? 1 : 0, signal: null, usageJson: null,
  resultJson: { summary: status === "failed" ? "Sample verification failed" : "Sample verification completed" },
  sessionIdBefore: null, sessionIdAfter: null, logStore: null, logRef: null, logBytes: null,
  logSha256: null, logCompressed: false, stdoutExcerpt: null, stderrExcerpt: null, errorCode: null,
  externalRunId: null, processPid: null, processStartedAt: null, lastOutputAt: null,
  lastOutputSeq: 0, lastOutputStream: null, lastOutputBytes: null, retryOfRunId: null,
  processLossRetryCount: 0, livenessState: null, livenessReason: null, continuationAttempt: 0,
  lastUsefulActionAt: null, nextAction: null, contextSnapshot: null,
  createdAt: new Date("2026-09-14T00:00:00Z"), updatedAt: new Date("2026-09-14T00:01:00Z"),
}));

const AUDIT_ACTION_RECORDS: AuditActionRecord[] = [
  {
    id: "audit-record-1",
    companyId: AUDIT_COMPANY_ID,
    actorType: "agent",
    actorId: "agent-codex",
    action: "issue.status_changed",
    entityType: "issue",
    entityId: "issue-storybook-1",
    agentId: "agent-codex",
    runId: "run-storybook-1",
    responsibleUserId: "user-board",
    details: { from: "todo", to: "in_progress" },
    createdAt: auditAt(12),
    entity: {
      issue: { id: "issue-storybook-1", identifier: "PAP-1641", title: "Create super-detailed storybooks for the project" },
      comment: null,
      document: null,
    },
  },
  {
    id: "audit-record-2",
    companyId: AUDIT_COMPANY_ID,
    actorType: "user",
    actorId: "user-board",
    action: "approval.revision_requested",
    entityType: "approval",
    entityId: "approval-budget",
    agentId: null,
    runId: null,
    responsibleUserId: "user-board",
    details: { type: "budget_override_required" },
    createdAt: auditAt(38),
    entity: { issue: null, comment: null, document: null },
  },
  {
    id: "audit-record-3",
    companyId: AUDIT_COMPANY_ID,
    actorType: "system",
    actorId: "system",
    action: "budget.hard_stop",
    entityType: "agent",
    entityId: "agent-codex",
    agentId: "agent-codex",
    runId: null,
    responsibleUserId: null,
    details: { observedAmount: 43_200, budgetAmount: 40_000 },
    createdAt: auditAt(70),
    entity: { issue: null, comment: null, document: null },
  },
];

const AUDIT_ACTIONS_RESPONSE_POPULATED: AuditActionsResponse = {
  items: AUDIT_ACTION_RECORDS,
  nextCursor: null,
  accessTier: "full",
};

const AUDIT_ACTIONS_RESPONSE_EMPTY: AuditActionsResponse = {
  items: [],
  nextCursor: null,
  accessTier: "full",
};

const COST_SUMMARY: CostSummary = {
  companyId: AUDIT_COMPANY_ID,
  spendCents: 67_500,
  budgetCents: 250_000,
  utilizationPercent: 27,
};

const COST_BY_AGENT: CostByAgent[] = [
  {
    agentId: "agent-codex",
    agentName: "CodexCoder",
    agentStatus: "active",
    costCents: 43_200,
    inputTokens: 1_050_000,
    cachedInputTokens: 164_000,
    outputTokens: 318_000,
    apiRunCount: 9,
    subscriptionRunCount: 26,
    subscriptionCachedInputTokens: 164_000,
    subscriptionInputTokens: 1_050_000,
    subscriptionOutputTokens: 318_000,
  },
];

const COST_BY_PROJECT: CostByProject[] = [
  {
    projectId: "project-board-ui",
    projectName: "Paperclip App",
    costCents: 43_200,
    inputTokens: 1_050_000,
    cachedInputTokens: 164_000,
    outputTokens: 318_000,
  },
];

const COST_BY_AGENT_MODEL: CostByAgentModel[] = [
  {
    agentId: "agent-codex",
    agentName: "CodexCoder",
    provider: "openai",
    biller: "openai",
    billingType: "subscription_included",
    model: "gpt-5.4-codex",
    costCents: 0,
    inputTokens: 1_050_000,
    cachedInputTokens: 164_000,
    outputTokens: 318_000,
  },
];

const COST_BY_PROVIDER: CostByProviderModel[] = [
  {
    provider: "openai",
    biller: "openai",
    billingType: "subscription_included",
    model: "gpt-5.4-codex",
    costCents: 0,
    inputTokens: 1_050_000,
    cachedInputTokens: 164_000,
    outputTokens: 318_000,
    apiRunCount: 0,
    subscriptionRunCount: 26,
    subscriptionCachedInputTokens: 164_000,
    subscriptionInputTokens: 1_050_000,
    subscriptionOutputTokens: 318_000,
  },
];

const COST_BY_BILLER: CostByBiller[] = [
  {
    biller: "openai",
    costCents: 43_200,
    inputTokens: 1_050_000,
    cachedInputTokens: 164_000,
    outputTokens: 318_000,
    apiRunCount: 9,
    subscriptionRunCount: 26,
    subscriptionCachedInputTokens: 164_000,
    subscriptionInputTokens: 1_050_000,
    subscriptionOutputTokens: 318_000,
    providerCount: 1,
    modelCount: 1,
  },
];

const COST_WINDOW_SPEND: CostWindowSpendRow[] = [
  { provider: "openai", biller: "openai", window: "24h", windowHours: 24, costCents: 3_870, inputTokens: 218_000, cachedInputTokens: 32_000, outputTokens: 64_000 },
];

const COST_QUOTA_WINDOWS: ProviderQuotaResult[] = [];

const FINANCE_SUMMARY: FinanceSummary = {
  companyId: AUDIT_COMPANY_ID,
  debitCents: 74_200,
  creditCents: 12_000,
  netCents: 62_200,
  estimatedDebitCents: 18_400,
  eventCount: 7,
};

const FINANCE_BY_BILLER: FinanceByBiller[] = [
  { biller: "openai", debitCents: 74_200, creditCents: 12_000, netCents: 62_200, estimatedDebitCents: 18_400, eventCount: 7, kindCount: 3 },
];

const FINANCE_BY_KIND: FinanceByKind[] = [
  { eventKind: "inference_charge", debitCents: 49_820, creditCents: 0, netCents: 49_820, estimatedDebitCents: 12_700, eventCount: 9, billerCount: 3 },
];

const FINANCE_EVENTS: FinanceEvent[] = [
  {
    id: "finance-event-openai-invoice",
    companyId: AUDIT_COMPANY_ID,
    agentId: null,
    issueId: null,
    projectId: "project-board-ui",
    goalId: "goal-company",
    heartbeatRunId: null,
    costEventId: null,
    billingCode: "product",
    description: "Monthly ChatGPT/Codex business plan charge for engineering agents.",
    eventKind: "platform_fee",
    direction: "debit",
    biller: "openai",
    provider: "openai",
    executionAdapterType: "codex_local",
    pricingTier: "business",
    region: "us",
    model: null,
    quantity: 8,
    unit: "request",
    amountCents: 40_000,
    currency: "USD",
    estimated: false,
    externalInvoiceId: "INV-2026-04-OPENAI-1184",
    metadataJson: { paymentMethod: "corporate-card" },
    occurredAt: new Date(auditAt(1_260)),
    createdAt: new Date(auditAt(1_255)),
  },
];

const BUDGET_OVERVIEW: BudgetOverview = {
  companyId: AUDIT_COMPANY_ID,
  policies: [
    {
      policyId: "budget-company-ok",
      companyId: AUDIT_COMPANY_ID,
      scopeType: "company",
      scopeId: AUDIT_COMPANY_ID,
      scopeName: "Paperclip Storybook",
      metric: "billed_cents",
      windowKind: "calendar_month_utc",
      amount: 250_000,
      observedAmount: 67_500,
      remainingAmount: 182_500,
      utilizationPercent: 27,
      warnPercent: 80,
      hardStopEnabled: true,
      notifyEnabled: true,
      isActive: true,
      status: "ok",
      paused: false,
      pauseReason: null,
      windowStart: new Date("2026-09-01T00:00:00.000Z"),
      windowEnd: new Date("2026-10-01T00:00:00.000Z"),
    },
  ],
  activeIncidents: [],
  pausedAgentCount: 0,
  pausedProjectCount: 0,
  pendingApprovalCount: 0,
};

// ---------------------------------------------------------------------------
// Scenario: mounts the real page components under the real Layout shell, with
// window.fetch mocked per-pathname so useDateRange's dynamic from/to never
// breaks cache-key matching. Mutations (non-GET under /api/) return 403;
// GETs inside the audit/costs/budgets endpoint family with no fixture branch
// return 501; everything else falls through to the original fetch (handled by
// the global Storybook preview stub for chrome like /api/companies).
// ---------------------------------------------------------------------------

type PreviewState = "populated" | "empty" | "loading" | "error";

function AuditCostsScenario({
  scope,
  layout,
  state,
}: {
  scope: "activity" | "costs" | "budgets" | "runs" | "timeline";
  layout: "streamlined" | "production";
  state: PreviewState;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompanyId, setSelectedCompanyId } = useCompany();
  const [ready, setReady] = useState(false);
  const [initialPath] = useState(location.pathname);
  const streamlined = layout === "streamlined";
  const target = `/PAP${scope === "activity" ? "/activity" : streamlined ? `/activity/${scope}` : "/costs"}`;

  useEffect(() => {
    const originalFetch = window.fetch;
    const settingsKey = queryKeys.instance.experimentalSettings;
    const previousSettings = queryClient.getQueryData(settingsKey);
    queryClient.setQueryData(settingsKey, { enableStreamlinedUi: streamlined });

    window.fetch = async (input, init) => {
      const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
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
      // user-directory and agents list are served by the global Storybook
      // fetch stub (installed at preview module load, ahead of this mock) —
      // fall through to originalFetch for those instead of re-declaring them.

      if (url.pathname === `/api/companies/${AUDIT_COMPANY_ID}/heartbeat-runs`) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample runs could not be loaded." }, { status: 503 });
        const agentId = url.searchParams.get("agentId");
        return Response.json(state === "empty" ? [] : AUDIT_RUNS.filter((run) => !agentId || run.agentId === agentId));
      }

      // Activity/audit endpoint family.
      if (url.pathname === `/api/companies/${AUDIT_COMPANY_ID}/audit/agent-actions`) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample audit feed could not be loaded." }, { status: 503 });
        return Response.json(state === "empty" ? AUDIT_ACTIONS_RESPONSE_EMPTY : AUDIT_ACTIONS_RESPONSE_POPULATED);
      }
      if (url.pathname === `/api/companies/${AUDIT_COMPANY_ID}/audit/agent-actions.csv`) {
        return Response.json({ error: "This preview is read-only." }, { status: 403 });
      }

      // Costs/budgets/finance endpoint family. All finance-* reads live under
      // /costs/finance-* in ui/src/api/costs.ts (costsApi.financeSummary,
      // .financeByBiller, .financeByKind, .financeEvents) — there is no
      // separate top-level /finance/* route to match here.
      const costsMatch = url.pathname.match(new RegExp(`^/api/companies/${AUDIT_COMPANY_ID}/costs/([^/]+)$`));
      if (costsMatch) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample costs could not be loaded." }, { status: 503 });
        const empty = state === "empty";
        switch (costsMatch[1]) {
          case "summary":
            return Response.json(empty ? { ...COST_SUMMARY, spendCents: 0, utilizationPercent: 0 } : COST_SUMMARY);
          case "by-agent":
            return Response.json(empty ? [] : COST_BY_AGENT);
          case "by-agent-model":
            return Response.json(empty ? [] : COST_BY_AGENT_MODEL);
          case "by-project":
            return Response.json(empty ? [] : COST_BY_PROJECT);
          case "by-provider":
            return Response.json(empty ? [] : COST_BY_PROVIDER);
          case "by-biller":
            return Response.json(empty ? [] : COST_BY_BILLER);
          case "finance-summary":
            return Response.json(empty ? { ...FINANCE_SUMMARY, debitCents: 0, creditCents: 0, netCents: 0, estimatedDebitCents: 0, eventCount: 0 } : FINANCE_SUMMARY);
          case "finance-by-biller":
            return Response.json(empty ? [] : FINANCE_BY_BILLER);
          case "finance-by-kind":
            return Response.json(empty ? [] : FINANCE_BY_KIND);
          case "finance-events":
            return Response.json(empty ? [] : FINANCE_EVENTS);
          case "window-spend":
            return Response.json(empty ? [] : COST_WINDOW_SPEND);
          case "quota-windows":
            return Response.json(COST_QUOTA_WINDOWS);
          default:
            return Response.json({ error: "No fixture for this costs endpoint." }, { status: 501 });
        }
      }
      if (url.pathname === `/api/companies/${AUDIT_COMPANY_ID}/budgets/overview`) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample budgets could not be loaded." }, { status: 503 });
        return Response.json(
          state === "empty" ? { ...BUDGET_OVERVIEW, policies: [], activeIncidents: [] } : BUDGET_OVERVIEW,
        );
      }

      return originalFetch(input, init);
    };

    setReady(true);
    return () => {
      window.fetch = originalFetch;
      if (previousSettings === undefined) {
        queryClient.removeQueries({ queryKey: settingsKey, exact: true });
      } else {
        queryClient.setQueryData(settingsKey, previousSettings);
      }
      queryClient.removeQueries({
        predicate: ({ queryKey }) =>
          queryKey.some(
            (part) =>
              typeof part === "string"
              && (part === "audit" || part === "costs" || part === "budgets" || part === AUDIT_COMPANY_ID),
          ),
      });
    };
  }, [layout, queryClient, scope, state, streamlined]);

  useEffect(() => {
    if (selectedCompanyId !== AUDIT_COMPANY_ID) setSelectedCompanyId(AUDIT_COMPANY_ID);
  }, [selectedCompanyId, setSelectedCompanyId]);
  useEffect(() => {
    if (location.pathname === initialPath && initialPath !== target) navigate(target, { replace: true });
  }, [initialPath, location.pathname, navigate, target]);

  if (!ready || selectedCompanyId !== AUDIT_COMPANY_ID) return null;

  // Mirror App.tsx's own route wiring for these two owners exactly, rather
  // than re-deriving it from the streamlined flag inside a shared component:
  // activity's streamlined/production split already lives in CompanyActivity
  // (it reads the same seeded experimental-settings flag), but Costs has two
  // structurally different owners (embedded AuditHub tab vs. standalone page)
  // that App.tsx picks by branch, not by prop.
  const page = scope === "activity" ? (
    streamlined ? <CompanyActivity /> : <ProductionCompanyActivity />
  ) : (
    streamlined ? <AuditHub section={scope} /> : <ProductionCosts />
  );

  return (
    <PluginLauncherProvider>
      <Routes>
        <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
          {streamlined ? <>
            <Route path="activity" element={<CompanyActivity />} />
            <Route path="activity/costs" element={<AuditHub section="costs" />} />
            <Route path="activity/timeline" element={<AuditHub section="timeline" />} />
            <Route path="activity/runs" element={<AuditHub section="runs" />} />
            <Route path="activity/budgets" element={<AuditHub section="budgets" />} />
          </> : <Route path={scope === "activity" ? "activity" : "costs"} element={page} />}
          <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
        </Route>
      </Routes>
    </PluginLauncherProvider>
  );
}

const meta = {
  title: "Pages/Warm Workspace/Audit & Costs",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "off" },
    docs: { description: { component: "Read-only sample data for design verification; not live E2E." } },
  },
} satisfies Meta<typeof AuditCostsScenario>;
export default meta;

type Story = StoryObj<typeof AuditCostsScenario>;

// Streamlined activity (AuditHub section="activity" → AuditFeed).
export const ActivityStreamlinedPopulated: Story = {
  render: () => <AuditCostsScenario scope="activity" layout="streamlined" state="populated" />,
};
export const ActivityStreamlinedEmpty: Story = {
  render: () => <AuditCostsScenario scope="activity" layout="streamlined" state="empty" />,
};
export const ActivityStreamlinedLoading: Story = {
  render: () => <AuditCostsScenario scope="activity" layout="streamlined" state="loading" />,
};
export const ActivityStreamlinedError: Story = {
  render: () => <AuditCostsScenario scope="activity" layout="streamlined" state="error" />,
};

// Production activity (CompanyActivity.production → AuditFeed.production).
export const ActivityProductionPopulated: Story = {
  render: () => <AuditCostsScenario scope="activity" layout="production" state="populated" />,
};
export const ActivityProductionEmpty: Story = {
  render: () => <AuditCostsScenario scope="activity" layout="production" state="empty" />,
};
export const ActivityProductionLoading: Story = {
  render: () => <AuditCostsScenario scope="activity" layout="production" state="loading" />,
};
export const ActivityProductionError: Story = {
  render: () => <AuditCostsScenario scope="activity" layout="production" state="error" />,
};

// Streamlined costs (AuditHub section="costs" → Costs embedded overview).
export const CostsStreamlinedPopulated: Story = {
  render: () => <AuditCostsScenario scope="costs" layout="streamlined" state="populated" />,
};
export const CostsStreamlinedEmpty: Story = {
  render: () => <AuditCostsScenario scope="costs" layout="streamlined" state="empty" />,
};
export const CostsStreamlinedLoading: Story = {
  render: () => <AuditCostsScenario scope="costs" layout="streamlined" state="loading" />,
};
export const CostsStreamlinedError: Story = {
  render: () => <AuditCostsScenario scope="costs" layout="streamlined" state="error" />,
};

export const TimelinePopulated: Story = {
  render: () => <AuditCostsScenario scope="timeline" layout="streamlined" state="populated" />,
};

export const RunsPopulated: Story = {
  render: () => <AuditCostsScenario scope="runs" layout="streamlined" state="populated" />,
};
export const RunsEmpty: Story = {
  render: () => <AuditCostsScenario scope="runs" layout="streamlined" state="empty" />,
};
export const RunsLoading: Story = {
  render: () => <AuditCostsScenario scope="runs" layout="streamlined" state="loading" />,
};
export const RunsError: Story = {
  render: () => <AuditCostsScenario scope="runs" layout="streamlined" state="error" />,
};

export const BudgetsPopulated: Story = {
  render: () => <AuditCostsScenario scope="budgets" layout="streamlined" state="populated" />,
};
export const BudgetsEmpty: Story = {
  render: () => <AuditCostsScenario scope="budgets" layout="streamlined" state="empty" />,
};
export const BudgetsLoading: Story = {
  render: () => <AuditCostsScenario scope="budgets" layout="streamlined" state="loading" />,
};
export const BudgetsError: Story = {
  render: () => <AuditCostsScenario scope="budgets" layout="streamlined" state="error" />,
};

// Production costs (standalone Costs.production).
export const CostsProductionPopulated: Story = {
  render: () => <AuditCostsScenario scope="costs" layout="production" state="populated" />,
};
export const CostsProductionEmpty: Story = {
  render: () => <AuditCostsScenario scope="costs" layout="production" state="empty" />,
};
export const CostsProductionLoading: Story = {
  render: () => <AuditCostsScenario scope="costs" layout="production" state="loading" />,
};
export const CostsProductionError: Story = {
  render: () => <AuditCostsScenario scope="costs" layout="production" state="error" />,
};
