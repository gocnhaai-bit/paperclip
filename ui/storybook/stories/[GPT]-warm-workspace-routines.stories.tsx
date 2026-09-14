import type { RoutineListItem } from "@paperclipai/shared";
import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { useQueryClient } from "@tanstack/react-query";
import { Routines } from "@/pages/Routines";
import { Routines as ProductionRoutines } from "@/pages/Routines.production";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";
import { storybookAgents, storybookProjects } from "../fixtures/paperclipData";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCompany } from "@/context/CompanyContext";

/**
 * Real Routines page mounted under Layout/Layout.production, seeding fetch
 * stubs for routines/folders/agents/projects/user-directory. Populated/empty/
 * loading/error states are previewed read-only. Mutations fail 403.
 *
 * Agents and projects use global existing fixtures (do not hang on loading=true);
 * only routines/folders honor the scenario state.
 */

const ROUTINES_COMPANY_ID = "company-storybook";

// Sample routine records; minimal schema match for list view.
const SAMPLE_ROUTINES: RoutineListItem[] = [
  { id: "routine-digest", title: "Weekly digest", status: "active" },
  { id: "routine-triage", title: "Triage stale issues", status: "active" },
  { id: "routine-changelog", title: "Nightly changelog draft", status: "paused" },
].map((routine) => ({
  ...routine, companyId: ROUTINES_COMPANY_ID, projectId: "project-board-ui", assigneeAgentId: "agent-codex",
  goalId: null, parentIssueId: null, description: null, priority: "medium", folderId: null,
  concurrencyPolicy: "skip_if_active", catchUpPolicy: "skip_missed", activityGatePolicy: "always", activityGateScope: "project",
  variables: [], latestRevisionId: null, latestRevisionNumber: 1,
  createdByAgentId: null, createdByUserId: "user-board", responsibleUserId: "user-board",
  updatedByAgentId: null, updatedByUserId: "user-board", lastTriggeredAt: null, lastEnqueuedAt: null,
  createdAt: new Date("2026-06-01T08:00:00Z"), updatedAt: new Date("2026-06-09T08:00:00Z"),
  triggers: [], lastRun: null, activeIssue: null,
}));

type RoutinesScenarioState = "populated" | "empty" | "loading" | "error";

function RoutinesScenario({
  streamlined = true,
  state = "populated",
}: {
  streamlined?: boolean;
  state?: RoutinesScenarioState;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompanyId, setSelectedCompanyId } = useCompany();
  const [ready, setReady] = useState(false);
  const [initialPath] = useState(location.pathname);

  const routePrefix = "/PAP/routines";
  const target = routePrefix;

  useEffect(() => {
    const originalFetch = window.fetch;
    const settingsKey = queryKeys.instance.experimentalSettings;
    const previousSettings = queryClient.getQueryData(settingsKey);
    queryClient.setQueryData(settingsKey, { enableStreamlinedUi: streamlined });

    window.fetch = async (input, init) => {
      const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(rawUrl, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

      // Read-only preview: any mutating call anywhere under /api fails closed.
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

      // Routines list; state controls loading/error/empty.
      const companyRoutinesMatch = url.pathname.match(/^\/api\/companies\/([^/]+)\/routines$/);
      if (companyRoutinesMatch) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample routines could not be loaded." }, { status: 503 });
        if (state === "empty") return Response.json([]);
        return Response.json(SAMPLE_ROUTINES);
      }

      // Folders for routines; shape: { folders: [...], allCount, unfiledCount }.
      const companyFoldersMatch = url.pathname.match(/^\/api\/companies\/([^/]+)\/folders$/);
      if (companyFoldersMatch) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample folders could not be loaded.", folders: [] }, { status: 503 });
        const routineCount = state === "empty" ? 0 : SAMPLE_ROUTINES.length;
        return Response.json({ kind: "routine", folders: [], allCount: routineCount, unfiledCount: routineCount });
      }

      // Agents; use global fixture (never hangs on loading).
      const companyAgentsMatch = url.pathname.match(/^\/api\/companies\/([^/]+)\/agents$/);
      if (companyAgentsMatch) {
        return Response.json(storybookAgents.filter((a) => a.companyId === companyAgentsMatch[1]));
      }

      // Projects; use global fixture (never hangs on loading).
      const companyProjectsMatch = url.pathname.match(/^\/api\/companies\/([^/]+)\/projects$/);
      if (companyProjectsMatch) {
        const includeArchived = url.searchParams.has("includeArchived");
        const projects = storybookProjects.filter((p) => p.companyId === companyProjectsMatch[1]);
        if (!includeArchived) return Response.json(projects.filter((p) => !p.archivedAt));
        return Response.json(projects);
      }

      // User directory; correct path is /companies/:companyId/user-directory (no /access prefix).
      const companyMembersMatch = url.pathname.match(/^\/api\/companies\/([^/]+)\/user-directory$/);
      if (companyMembersMatch) {
        return Response.json({ users: [] });
      }

      if (
        url.pathname.startsWith("/api/routines") ||
        /^\/api\/companies\/[^/]+\/(routines|folders)/.test(url.pathname)
      ) {
        return Response.json({ error: "No fixture for this routines endpoint." }, { status: 501 });
      }

      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      queryClient.removeQueries({ predicate: ({ queryKey }) => queryKey[0] === "routines" });
      queryClient.removeQueries({ predicate: ({ queryKey }) => queryKey[0] === "folders" });
      if (previousSettings === undefined) {
        queryClient.removeQueries({ queryKey: settingsKey, exact: true });
      } else {
        queryClient.setQueryData(settingsKey, previousSettings);
      }
    };
  }, [queryClient, state, streamlined]);

  useEffect(() => {
    if (selectedCompanyId !== ROUTINES_COMPANY_ID) setSelectedCompanyId(ROUTINES_COMPANY_ID);
  }, [selectedCompanyId, setSelectedCompanyId]);

  useEffect(() => {
    if (location.pathname === initialPath && initialPath !== target) navigate(target, { replace: true });
  }, [initialPath, location.pathname, navigate, target]);

  if (!ready || selectedCompanyId !== ROUTINES_COMPANY_ID) return null;

  const LayoutComponent = streamlined ? Layout : ProductionLayout;

  return (
    <PluginLauncherProvider>
      <Routes>
        <Route path="/:companyPrefix" element={<LayoutComponent />}>
          <Route path="routines" element={streamlined ? <Routines /> : <ProductionRoutines />} />
          <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
        </Route>
      </Routes>
    </PluginLauncherProvider>
  );
}

const meta = {
  title: "Pages/Warm Workspace/Routines",
  component: RoutinesScenario,
  parameters: { layout: "fullscreen", a11y: { test: "off" } },
} satisfies Meta<typeof RoutinesScenario>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
  args: { streamlined: true, state: "populated" },
  name: "Streamlined · Populated",
};

export const PopulatedClassic: Story = {
  args: { streamlined: false, state: "populated" },
  name: "Classic · Populated",
};

export const Empty: Story = {
  args: { streamlined: true, state: "empty" },
  name: "Streamlined · Empty",
};

export const EmptyClassic: Story = {
  args: { streamlined: false, state: "empty" },
  name: "Classic · Empty",
};

export const Loading: Story = {
  args: { streamlined: true, state: "loading" },
  name: "Streamlined · Loading",
};

export const LoadingClassic: Story = {
  args: { streamlined: false, state: "loading" },
  name: "Classic · Loading",
};

export const Error: Story = {
  args: { streamlined: true, state: "error" },
  name: "Streamlined · Error",
};

export const ErrorClassic: Story = {
  args: { streamlined: false, state: "error" },
  name: "Classic · Error",
};
