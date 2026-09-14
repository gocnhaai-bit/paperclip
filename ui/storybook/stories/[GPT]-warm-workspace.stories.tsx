import type { IssueComment, IssueAttachment, IssueDocument, IssueWorkProduct } from "@paperclipai/shared";
import { attachmentArtifactWorkProductMetadataSchema } from "@paperclipai/shared";
import attachmentSample from "../fixtures/warm-workspace-attachment.json";
import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { IssueDetail } from "@/pages/IssueDetail";
import { seedIssueDetailCache } from "@/lib/issueDetailCache";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
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
  parameters: { layout: "fullscreen", docs: { description: { component: "Read-only sample data for design verification; not live E2E." } } },
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

const TASK_DETAIL_FIXTURE = {
  ...storybookIssues[0]!,
  status: "todo" as const,
  executionRunId: null,
  checkoutRunId: null,
  currentExecutionWorkspace: null,
  executionWorkspaceId: null,
  isUnreadForMe: false,
};

const TASK_DETAIL_SECOND_FIXTURE = {
  ...TASK_DETAIL_FIXTURE,
  id: "warm-second-task",
  identifier: "PAP-1642",
  title: "Verify navigation between sample tasks",
};

const TASK_PREVIEW_DATE = new Date("2026-09-14T00:00:00Z");
const TASK_PREVIEW_COMMENTS: IssueComment[] = Array.from({ length: 18 }, (_, index) => ({
  id: `warm-comment-${index + 1}`,
  companyId: TASK_DETAIL_FIXTURE.companyId,
  issueId: TASK_DETAIL_FIXTURE.id,
  authorType: index % 2 ? "agent" : "user",
  authorAgentId: index % 2 ? TASK_DETAIL_FIXTURE.assigneeAgentId : null,
  authorUserId: index % 2 ? null : "user-board",
  body: index === 17
    ? "The review notes and implementation plan are attached. Check desktop thread scrolling, mobile properties, and keyboard navigation before accepting the layout."
    : `Review checkpoint ${index + 1}\n\nKeep the task conversation, properties and composer accessible across desktop and mobile. This sample discussion exercises a populated thread without starting a live run.\n\n- Preserve the existing task actions.\n- Check long content and document navigation.`,
  presentation: null,
  metadata: null,
  createdAt: new Date(TASK_PREVIEW_DATE.getTime() + index * 60_000),
  updatedAt: new Date(TASK_PREVIEW_DATE.getTime() + index * 60_000),
}));
const TASK_PREVIEW_PLAN: IssueDocument = {
  id: "warm-plan", companyId: TASK_DETAIL_FIXTURE.companyId, issueId: TASK_DETAIL_FIXTURE.id,
  key: "plan", title: "Workspace layout review", format: "markdown",
  latestRevisionId: "warm-plan-revision", latestRevisionNumber: 1,
  createdByAgentId: null, createdByUserId: "user-board",
  updatedByAgentId: null, updatedByUserId: "user-board",
  lockedAt: null, lockedByAgentId: null, lockedByUserId: null,
  createdAt: TASK_PREVIEW_DATE, updatedAt: TASK_PREVIEW_DATE,
  body: "# Workspace layout review\n\n## Acceptance\n\n- Keep the composer visible on desktop.\n- Scroll the document on mobile.\n- Open properties and return to the conversation.\n\n## Verification\n\nUse read-only sample content; do not create agents, tasks or runs.",
};
const TASK_PREVIEW_ATTACHMENT: IssueAttachment = {
  id: attachmentSample.id, companyId: TASK_DETAIL_FIXTURE.companyId, issueId: TASK_DETAIL_FIXTURE.id,
  issueCommentId: null, assetId: "warm-asset", provider: "local",
  objectKey: "warm-preview/review-notes.txt", contentType: "text/plain", byteSize: 47,
  sha256: "e57c1e3a8cefdaceef9ca1438d9d84e142247a166f4019acf5df0ef8e883de47",
  originalFilename: attachmentSample.filename,
  createdByAgentId: null, createdByUserId: "user-board",
  createdAt: TASK_PREVIEW_DATE, updatedAt: TASK_PREVIEW_DATE,
  contentPath: `/api/attachments/${attachmentSample.id}/content`,
};
const TASK_PREVIEW_WORK_PRODUCT: IssueWorkProduct = {
  id: "warm-work-product", companyId: TASK_DETAIL_FIXTURE.companyId,
  projectId: TASK_DETAIL_FIXTURE.projectId, issueId: TASK_DETAIL_FIXTURE.id,
  executionWorkspaceId: null, runtimeServiceId: null, type: "artifact", provider: "paperclip",
  externalId: null, title: "Workspace layout review notes", url: TASK_PREVIEW_ATTACHMENT.contentPath,
  status: "ready_for_review", reviewState: "needs_board_review", isPrimary: true, healthStatus: "unknown",
  summary: "Read-only sample review notes for the populated task preview.",
  metadata: attachmentArtifactWorkProductMetadataSchema.parse({
    attachmentId: TASK_PREVIEW_ATTACHMENT.id, contentType: attachmentSample.contentType,
    byteSize: TASK_PREVIEW_ATTACHMENT.byteSize, contentPath: TASK_PREVIEW_ATTACHMENT.contentPath,
    openPath: TASK_PREVIEW_ATTACHMENT.contentPath, downloadPath: `${TASK_PREVIEW_ATTACHMENT.contentPath}?download=1`,
    originalFilename: TASK_PREVIEW_ATTACHMENT.originalFilename,
  }),
  createdByRunId: null, createdAt: TASK_PREVIEW_DATE, updatedAt: TASK_PREVIEW_DATE,
};

function TaskDetailScenario({ classic, streamlined = true, entry = "?from=issues", state = "populated", longText = false, navigation = false }: {
  classic: boolean;
  streamlined?: boolean;
  entry?: string;
  state?: "populated" | "empty" | "loading" | "error";
  longText?: boolean;
  navigation?: boolean;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompanyId, setSelectedCompanyId } = useCompany();
  const [ready, setReady] = useState(false);
  const [initialPath] = useState(location.pathname);
  const target = `/PAP/issues/${TASK_DETAIL_FIXTURE.identifier}${entry}`;

  useEffect(() => {
    const originalFetch = window.fetch;
    const task = longText ? { ...TASK_DETAIL_FIXTURE, title: "WorkspaceReview".repeat(24) } : TASK_DETAIL_FIXTURE;
    const comments = longText ? TASK_PREVIEW_COMMENTS.map((comment) => ({
      ...comment, body: `${comment.body}\n\n${"UnbrokenReviewContext".repeat(32)}`,
    })) : TASK_PREVIEW_COMMENTS;
    const attachment = longText ? {
      ...TASK_PREVIEW_ATTACHMENT, originalFilename: `${"WorkspaceReviewNotes".repeat(16)}.txt`,
    } : TASK_PREVIEW_ATTACHMENT;
    const settingsKey = queryKeys.instance.experimentalSettings;
    const previousSettings = queryClient.getQueryData(settingsKey);
    queryClient.setQueryData(settingsKey, {
      enableClassicTaskInterface: classic,
      enableStreamlinedUi: streamlined,
    });
    if (state !== "loading" && state !== "error") seedIssueDetailCache(queryClient, task);
    queryClient.setQueryData(
      queryKeys.issues.listByDescendantRoot(PROJECT_DETAIL_COMPANY_ID, TASK_DETAIL_FIXTURE.id),
      [],
    );
    // Polling and refetch-on-mount must stay inside this read-only preview.
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
        return Response.json({ enableClassicTaskInterface: classic, enableStreamlinedUi: streamlined });
      }
      const match = url.pathname.match(/^\/api\/issues\/([^/]+)(?:\/(.*))?$/);
      if (navigation && match && [TASK_DETAIL_SECOND_FIXTURE.id, TASK_DETAIL_SECOND_FIXTURE.identifier].includes(match[1]!)) {
        if (!match[2]) return Response.json(TASK_DETAIL_SECOND_FIXTURE);
        if (match[2] === "documents/plan") return Response.json({ error: "No plan document." }, { status: 404 });
        if (["comments", "attachments", "work-products", "documents", "activity", "runs", "live-runs", "interactions", "approvals", "feedback-votes"].includes(match[2])) return Response.json([]);
        if (["active-run", "watchdog"].includes(match[2])) return Response.json(null);
        return Response.json({ error: "No fixture for this task endpoint." }, { status: 501 });
      }
      if (match && [TASK_DETAIL_FIXTURE.id, TASK_DETAIL_FIXTURE.identifier].includes(match[1]!)) {
        if (!match[2]) {
          if (state === "loading") return new Promise<Response>(() => {});
          if (state === "error") return Response.json({ error: "Sample task could not be loaded." }, { status: 503 });
          return Response.json(task);
        }
        if (state === "empty") {
          if (match[2] === "documents/plan") return Response.json({ error: "No plan document." }, { status: 404 });
          if (["comments", "attachments", "work-products", "documents"].includes(match[2])) return Response.json([]);
        }
        if (match[2] === "comments") return Response.json([...comments].reverse());
        if (match[2]?.startsWith("comments/")) {
          const comment = comments.find((item) => item.id === match[2]!.slice("comments/".length));
          return comment ? Response.json(comment) : Response.json({ error: "Comment not found." }, { status: 404 });
        }
        if (match[2] === "attachments") return Response.json([attachment]);
        if (match[2] === "work-products") return Response.json([TASK_PREVIEW_WORK_PRODUCT]);
        if (match[2] === "documents") return Response.json([TASK_PREVIEW_PLAN]);
        if (match[2] === "documents/plan") return Response.json(TASK_PREVIEW_PLAN);
        if (["activity", "runs", "live-runs", "interactions", "approvals", "feedback-votes"].includes(match[2])) {
          return Response.json([]);
        }
        if (["active-run", "watchdog"].includes(match[2])) return Response.json(null);
        return Response.json({ error: "No fixture for this task endpoint." }, { status: 501 });
      }
      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      queryClient.removeQueries({
        predicate: ({ queryKey }) => queryKey.some((part) => [TASK_DETAIL_FIXTURE.id, TASK_DETAIL_FIXTURE.identifier, TASK_DETAIL_SECOND_FIXTURE.id, TASK_DETAIL_SECOND_FIXTURE.identifier].includes(String(part))),
      });
      if (previousSettings === undefined) {
        queryClient.removeQueries({ queryKey: settingsKey, exact: true });
      } else {
        queryClient.setQueryData(settingsKey, previousSettings);
      }
    };
  }, [classic, longText, navigation, queryClient, state, streamlined]);

  useEffect(() => {
    if (selectedCompanyId !== PROJECT_DETAIL_COMPANY_ID) setSelectedCompanyId(PROJECT_DETAIL_COMPANY_ID);
  }, [selectedCompanyId, setSelectedCompanyId]);
  useEffect(() => {
    if (location.pathname === initialPath && initialPath !== target) navigate(target, { replace: true });
  }, [initialPath, location.pathname, navigate, target]);

  useEffect(() => {
    // Native hash anchors must update Storybook's MemoryRouter, not the iframe URL.
    const handleHashLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      const hash = anchor?.getAttribute("href");
      if (!hash?.startsWith("#") || anchor?.target === "_blank") return;
      event.preventDefault();
      navigate({ pathname: location.pathname, search: location.search, hash });
    };
    document.addEventListener("click", handleHashLink);
    return () => document.removeEventListener("click", handleHashLink);
  }, [location.pathname, location.search, navigate]);

  if (!ready || selectedCompanyId !== PROJECT_DETAIL_COMPANY_ID) return null;
  return (
    <PluginLauncherProvider>
      {navigation ? (
        <nav aria-label="Preview history" className="flex gap-3 bg-background p-2">
          <button onClick={() => navigate(`/PAP/issues/${TASK_DETAIL_SECOND_FIXTURE.identifier}?from=issues`)}>Other sample task</button>
          <button onClick={() => navigate(-1)}>Preview back</button>
          <button onClick={() => navigate(1)}>Preview forward</button>
        </nav>
      ) : null}
      <Routes>
        <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
          <Route path="issues/:issueId" element={<IssueDetail />} />
          <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
        </Route>
      </Routes>
    </PluginLauncherProvider>
  );
}

export const TaskDetailChatShell: StoryObj = {
  render: () => <TaskDetailScenario classic={false} />,
};

export const TaskDetailClassic: StoryObj = {
  render: () => <TaskDetailScenario classic />,
};

export const TaskDetailProductionChatShell: StoryObj = {
  render: () => <TaskDetailScenario classic={false} streamlined={false} />,
};

export const TaskDetailProductionClassic: StoryObj = {
  render: () => <TaskDetailScenario classic streamlined={false} />,
};

export const TaskDetailInboxEntry: StoryObj = {
  render: () => <TaskDetailScenario classic={false} entry="?from=inbox" />,
};

export const TaskDetailPlanLink: StoryObj = {
  render: () => <TaskDetailScenario classic={false} entry="?from=issues#document-plan" />,
};

export const TaskDetailCommentLink: StoryObj = {
  render: () => <TaskDetailScenario classic={false} entry="?from=issues#comment-warm-comment-4" />,
};

export const TaskDetailEmpty: StoryObj = {
  render: () => <TaskDetailScenario classic={false} state="empty" />,
};

export const TaskDetailLoading: StoryObj = {
  render: () => <TaskDetailScenario classic={false} state="loading" />,
};

export const TaskDetailError: StoryObj = {
  render: () => <TaskDetailScenario classic={false} state="error" />,
};

export const TaskDetailNavigation: StoryObj = {
  render: () => <TaskDetailScenario classic={false} entry="?from=issues#document-plan" navigation />,
};

export const TaskDetailLongContent: StoryObj = {
  render: () => <TaskDetailScenario classic={false} longText />,
};

export const TaskDetailLongContentClassic: StoryObj = {
  render: () => <TaskDetailScenario classic longText />,
};
