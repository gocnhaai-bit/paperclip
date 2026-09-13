import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";
import { storybookProjects, storybookIssues } from "../fixtures/paperclipData";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCompany } from "@/context/CompanyContext";
import { Agents } from "@/pages/Agents";
import { Projects } from "@/pages/Projects";

function WarmWorkspacePreview({ page }: { page: "agents" | "projects" }) {
  const { selectedCompanyId, setSelectedCompanyId } = useCompany();
  useEffect(() => {
    if (selectedCompanyId !== "company-storybook") setSelectedCompanyId("company-storybook");
  }, [selectedCompanyId, setSelectedCompanyId]);
  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <p className="mb-6 text-xs text-muted-foreground">Design verification · Storybook sample data · no live agents</p>
      {page === "agents" ? <Agents initialView="cards" /> : <Projects />}
    </div>
  );
}

const meta = {
  title: "Pages/Warm Workspace",
  component: WarmWorkspacePreview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WarmWorkspacePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AgentCards: Story = { args: { page: "agents" } };
export const ProjectCards: Story = { args: { page: "projects" } };

/**
 * Mounts the real ProjectDetail route page (mirrors the Agent Detail story):
 * seed the QueryClient with fixture data, then navigate to the canonical
 * project URL so useParams resolves the fixture project.
 */
const PROJECT_DETAIL_COMPANY_ID = "company-storybook";
const PROJECT_DETAIL_FIXTURE = storybookProjects[0]!; // urlKey "board-ui"
const PROJECT_DETAIL_ISSUES = storybookIssues.filter(
  (issue) => issue.projectId === PROJECT_DETAIL_FIXTURE.id,
);

function seedProjectDetailData(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.setQueryData(
    [...queryKeys.projects.detail(PROJECT_DETAIL_FIXTURE.urlKey!), PROJECT_DETAIL_COMPANY_ID],
    PROJECT_DETAIL_FIXTURE,
  );
  queryClient.setQueryData(queryKeys.projects.list(PROJECT_DETAIL_COMPANY_ID), storybookProjects);
  queryClient.setQueryData(
    queryKeys.issues.listByProject(PROJECT_DETAIL_COMPANY_ID, PROJECT_DETAIL_FIXTURE.id),
    PROJECT_DETAIL_ISSUES,
  );
  queryClient.setQueryData(
    queryKeys.executionWorkspaces.list(PROJECT_DETAIL_COMPANY_ID, { projectId: PROJECT_DETAIL_FIXTURE.id }),
    [],
  );
  queryClient.setQueryData(queryKeys.budgets.overview(PROJECT_DETAIL_COMPANY_ID), {
    companyId: PROJECT_DETAIL_COMPANY_ID,
    policies: [],
    activeIncidents: [],
    pausedAgentCount: 0,
    pausedProjectCount: 0,
    pendingApprovalCount: 0,
  });
  queryClient.setQueryData(queryKeys.resourceMemberships.mine(PROJECT_DETAIL_COMPANY_ID), {
    projectMemberships: {},
    agentMemberships: {},
    starredProjects: [],
    starredAgents: [],
  });
}

function ProjectDetailScenario() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompanyId, setSelectedCompanyId } = useCompany();
  useState(() => {
    seedProjectDetailData(queryClient);
    return true;
  });

  useEffect(() => {
    if (selectedCompanyId !== PROJECT_DETAIL_COMPANY_ID) setSelectedCompanyId(PROJECT_DETAIL_COMPANY_ID);
  }, [selectedCompanyId, setSelectedCompanyId]);

  const target = `/PAP/projects/${PROJECT_DETAIL_FIXTURE.urlKey}/issues`;
  const onProjectRoute = location.pathname.startsWith(`/PAP/projects/${PROJECT_DETAIL_FIXTURE.urlKey}`);
  useEffect(() => {
    // One-way hop onto the project route; the page owns the URL afterwards
    // (tab changes append a segment), so never navigate back.
    if (!onProjectRoute) navigate(target, { replace: true });
  }, [onProjectRoute, navigate, target]);

  if (selectedCompanyId !== PROJECT_DETAIL_COMPANY_ID || !onProjectRoute) return null;

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <p className="mb-6 text-xs text-muted-foreground">Design verification · Storybook sample data · no live projects</p>
      <Routes>
        <Route path="/:companyPrefix/projects/:projectId/:filter?" element={<PluginLauncherProvider><ProjectDetail /></PluginLauncherProvider>} />
        <Route path="*" element={null} />
      </Routes>
    </div>
  );
}

type ProjectDetailStory = StoryObj;
export const ProjectDetailPage: ProjectDetailStory = {
  render: () => <ProjectDetailScenario />,
  parameters: { layout: "fullscreen", a11y: { test: "off" } },
};
