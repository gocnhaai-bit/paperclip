import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { useQueryClient } from "@tanstack/react-query";
import { Goals } from "@/pages/Goals";
import { GoalDetail } from "@/pages/GoalDetail";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";
import { storybookGoals } from "../fixtures/paperclipData";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCompany } from "@/context/CompanyContext";

/**
 * Real Goals + GoalDetail pages, mounted the same way as the Task Detail full
 * shell (`[GPT]-warm-workspace.stories.tsx` `TaskDetailScenario`): seed a
 * fetch stub scoped to the goals endpoints, navigate onto the canonical
 * `/PAP/goals(/:goalId)` route, and let the page own the URL afterwards so a
 * click from the Goals tree into a goal (and the breadcrumb back) is real
 * in-app navigation, not two disconnected stories.
 */

const GOAL_COMPANY_ID = "company-storybook";
// Has a child goal (goal-storybook) and a linked project (project-board-ui) —
// exercises populated Sub-Goals / Projects tabs.
const GOAL_DETAIL_POPULATED_ID = "goal-board-ux";
// Leaf goal with no children and no linked project — exercises the tabs'
// empty states while the goal record itself still loads normally.
const GOAL_DETAIL_EMPTY_ID = "goal-storybook";

type GoalsScenarioState = "populated" | "empty" | "loading" | "error";

function GoalsScenario({
  streamlined = true,
  entry = "list",
  state = "populated",
}: {
  streamlined?: boolean;
  entry?: "list" | "detail";
  state?: GoalsScenarioState;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompanyId, setSelectedCompanyId } = useCompany();
  const [ready, setReady] = useState(false);
  const [initialPath] = useState(location.pathname);

  const detailGoalId = state === "empty" ? GOAL_DETAIL_EMPTY_ID : GOAL_DETAIL_POPULATED_ID;
  const routePrefix = "/PAP/goals";
  const target = entry === "list" ? routePrefix : `${routePrefix}/${detailGoalId}`;

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
      // rather than reaching a real server (mirrors TaskDetailScenario).
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

      const goalDetailMatch = url.pathname.match(/^\/api\/goals\/([^/]+)$/);
      if (goalDetailMatch) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample goal could not be loaded." }, { status: 503 });
        const goal = storybookGoals.find((g) => g.id === goalDetailMatch[1]);
        return goal ? Response.json(goal) : Response.json({ error: "Goal not found." }, { status: 404 });
      }

      const companyGoalsMatch = url.pathname.match(/^\/api\/companies\/([^/]+)\/goals$/);
      if (companyGoalsMatch) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample goals could not be loaded." }, { status: 503 });
        if (entry === "list" && state === "empty") return Response.json([]);
        return Response.json(storybookGoals.filter((g) => g.companyId === companyGoalsMatch[1]));
      }

      if (
        url.pathname.startsWith("/api/goals") ||
        /^\/api\/companies\/[^/]+\/goals(\/|$)/.test(url.pathname)
      ) {
        return Response.json({ error: "No fixture for this goal endpoint." }, { status: 501 });
      }

      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      queryClient.removeQueries({ predicate: ({ queryKey }) => queryKey[0] === "goals" });
      if (previousSettings === undefined) {
        queryClient.removeQueries({ queryKey: settingsKey, exact: true });
      } else {
        queryClient.setQueryData(settingsKey, previousSettings);
      }
    };
  }, [entry, queryClient, state, streamlined]);

  useEffect(() => {
    if (selectedCompanyId !== GOAL_COMPANY_ID) setSelectedCompanyId(GOAL_COMPANY_ID);
  }, [selectedCompanyId, setSelectedCompanyId]);
  useEffect(() => {
    // One-shot hop onto the goals route, keyed off the path the story mounted
    // with (mirrors TaskDetailScenario's `initialPath`). Once the page has
    // navigated onward — into a goal, or back via the breadcrumb — this must
    // not fire again, or every in-app link back out of /goals gets dragged
    // back to `target` in a redirect loop.
    if (location.pathname === initialPath && initialPath !== target) navigate(target, { replace: true });
  }, [initialPath, location.pathname, navigate, target]);

  if (!ready || selectedCompanyId !== GOAL_COMPANY_ID) return null;

  return (
    <PluginLauncherProvider>
      <Routes>
        <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
          <Route path="goals" element={<Goals />} />
          <Route path="goals/:goalId" element={<GoalDetail />} />
          <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
        </Route>
      </Routes>
    </PluginLauncherProvider>
  );
}

const meta = {
  title: "Pages/Warm Workspace/Goals",
  component: GoalsScenario,
  parameters: { layout: "fullscreen", a11y: { test: "off" } },
} satisfies Meta<typeof GoalsScenario>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GoalsListPopulated: Story = { render: () => <GoalsScenario entry="list" state="populated" /> };
export const GoalsListEmpty: Story = { render: () => <GoalsScenario entry="list" state="empty" /> };
export const GoalsListLoading: Story = { render: () => <GoalsScenario entry="list" state="loading" /> };
export const GoalsListError: Story = { render: () => <GoalsScenario entry="list" state="error" /> };
export const GoalsListProductionLayout: Story = {
  render: () => <GoalsScenario entry="list" state="populated" streamlined={false} />,
};

export const GoalDetailPopulated: Story = { render: () => <GoalsScenario entry="detail" state="populated" /> };
export const GoalDetailEmpty: Story = { render: () => <GoalsScenario entry="detail" state="empty" /> };
export const GoalDetailLoading: Story = { render: () => <GoalsScenario entry="detail" state="loading" /> };
export const GoalDetailError: Story = { render: () => <GoalsScenario entry="detail" state="error" /> };
export const GoalDetailProductionLayout: Story = {
  render: () => <GoalsScenario entry="detail" state="populated" streamlined={false} />,
};
