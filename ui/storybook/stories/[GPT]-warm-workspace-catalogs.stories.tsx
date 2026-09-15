import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import type { CurrentBoardAccess } from "@/api/access";
import { AdvancedToolsRoute } from "@/pages/tools/AdvancedToolsRoute";
import { ProfileDetailRoute } from "@/pages/tools/profiles/ProfileDetailRoute";
import { ProfileWizardRoute } from "@/pages/tools/profiles/ProfileWizardRoute";
import { GatewaysList } from "@/pages/apps/gateways/GatewaysList";
import { GatewayDetail } from "@/pages/apps/gateways/GatewayDetail";
import type { ComposioServicesResponse } from "@/pages/apps/composio-services";
import { AppDetail } from "@/pages/apps/AppDetail";
import { AppsReview } from "@/pages/apps/AppsReview";
import { AppsConnect } from "@/pages/apps/AppsConnect";
import { Browse } from "@/pages/apps/Browse";
import { SkillStudio } from "@/pages/SkillStudio";
import { CompanySkills } from "@/pages/CompanySkills";
import { CompanySkills as ProductionSkills } from "@/pages/CompanySkills.production";
import { queryKeys } from "@/lib/queryKeys";
import type { ToolGatewayActivityResponse } from "@/api/tools";
import type {
  ConnectionGrantsResponse,
  ToolApplication,
  ToolCatalogEntry,
  ToolConnection,
  ToolMcpGatewayWithTokens,
  ToolProfileWithDetails,
  CompanySkillDetail,
  CompanySkillFileDetail,
  CompanySkillTestInput,
  CompanySkillTestRun,
  CompanySkillTestRunDetail,
  CompanySkillVersion,
} from "@paperclipai/shared";
import { library } from "../prototypes/agent-settings/fixtures";

const previewConnection: ToolConnection = {
  id: "warm-connected", companyId: "company-storybook", applicationId: "warm-application", uid: "warm-connected",
  name: "Workspace documents", connectionKind: "managed", connectionPurpose: "tool", ownership: "customer",
  transport: "mcp_remote", authKind: "none", credentialSource: "paperclip_vault", credentialPolicy: "shared",
  status: "active", enabled: true, transportConfig: {}, credentialSecretRefs: [],
  healthStatus: "healthy", healthCheckedAt: null, lastError: null, createdByAgentId: null, createdByUserId: null,
  createdAt: new Date("2026-09-14T08:00:00Z"), updatedAt: new Date("2026-09-14T08:00:00Z"),
};
const previewGrants: ConnectionGrantsResponse = {
  connection: { id: previewConnection.id, uid: previewConnection.uid }, grants: [], currentUserId: null, members: [],
  capabilities: { canConfigure: false, canCreateOrganizationGrant: false, canSetCompanyInstall: false,
    canConnectAsCurrentUser: false, canManageAgentInstalls: false, canViewOtherPersonalIdentities: false, editableAgentIds: [] },
};

const previewProfile: ToolProfileWithDetails = {
  id: "warm-profile",
  companyId: "company-storybook",
  profileKey: "workspace-operations",
  name: "Workspace operations",
  description: "Read documents and make routine updates without destructive tools.",
  status: "active",
  defaultAction: "deny",
  newToolsReviewedAt: new Date("2026-09-01T08:00:00Z"),
  metadata: null,
  createdAt: new Date("2026-08-20T08:00:00Z"),
  updatedAt: new Date("2026-09-14T08:00:00Z"),
  entries: [
    {
      id: "warm-profile-entry",
      companyId: "company-storybook",
      profileId: "warm-profile",
      selectorType: "application",
      effect: "include",
      applicationId: "warm-application",
      connectionId: null,
      catalogEntryId: null,
      toolName: null,
      riskLevel: null,
      conditions: null,
      createdAt: new Date("2026-08-20T08:00:00Z"),
      updatedAt: new Date("2026-08-20T08:00:00Z"),
    },
    {
      id: "warm-profile-entry-list",
      companyId: "company-storybook",
      profileId: "warm-profile",
      selectorType: "tool",
      effect: "include",
      applicationId: "warm-application",
      connectionId: null,
      catalogEntryId: "warm-tool-list",
      toolName: "documents.list",
      riskLevel: "read",
      conditions: null,
      createdAt: new Date("2026-08-20T08:00:00Z"),
      updatedAt: new Date("2026-08-20T08:00:00Z"),
    },
    {
      id: "warm-profile-entry-read",
      companyId: "company-storybook",
      profileId: "warm-profile",
      selectorType: "tool",
      effect: "include",
      applicationId: "warm-application",
      connectionId: null,
      catalogEntryId: "warm-tool-read",
      toolName: "documents.read",
      riskLevel: "read",
      conditions: null,
      createdAt: new Date("2026-08-20T08:00:00Z"),
      updatedAt: new Date("2026-08-20T08:00:00Z"),
    },
  ],
  bindings: [{
    id: "warm-profile-binding",
    companyId: "company-storybook",
    profileId: "warm-profile",
    targetType: "agent",
    targetId: "warm-agent",
    priority: 0,
    metadata: null,
    createdByAgentId: null,
    createdByUserId: "user-board",
    createdAt: new Date("2026-08-20T08:00:00Z"),
    updatedAt: new Date("2026-08-20T08:00:00Z"),
  }],
  summary: {
    accessMode: "selected",
    allowedToolCount: 2,
    allowedApplicationCount: 1,
    excludedToolCount: 0,
    totalToolCount: 2,
    assignmentCount: 1,
    appliesToAgentCount: 1,
    isCompanyDefault: false,
  },
};

const previewApplication: ToolApplication = {
  id: "warm-application",
  companyId: "company-storybook",
  applicationKey: "workspace-documents",
  name: "Workspace documents",
  description: "Read-only document metadata for the workspace.",
  type: "mcp_http",
  status: "active",
  pluginId: null,
  ownerAgentId: null,
  ownerUserId: "user-board",
  metadata: null,
  archivedAt: null,
  createdAt: new Date("2026-08-20T08:00:00Z"),
  updatedAt: new Date("2026-09-14T08:00:00Z"),
};

const previewTools: ToolCatalogEntry[] = [
  {
    id: "warm-tool-list",
    companyId: "company-storybook",
    applicationId: previewApplication.id,
    connectionId: previewConnection.id,
    entryKind: "tool",
    toolName: "documents.list",
    title: "List documents",
    description: "List document metadata.",
    inputSchema: null,
    outputSchema: null,
    annotations: null,
    riskLevel: "read",
    isReadOnly: true,
    isWrite: false,
    isDestructive: false,
    status: "active",
    addedAt: new Date("2026-08-20T08:00:00Z"),
    version: null,
    schemaHash: null,
    firstSeenAt: new Date("2026-08-20T08:00:00Z"),
    lastSeenAt: new Date("2026-09-14T08:00:00Z"),
    reviewedAt: new Date("2026-08-20T08:00:00Z"),
    reviewedByAgentId: null,
    reviewedByUserId: "user-board",
    createdAt: new Date("2026-08-20T08:00:00Z"),
    updatedAt: new Date("2026-09-14T08:00:00Z"),
  },
  {
    id: "warm-tool-read",
    companyId: "company-storybook",
    applicationId: previewApplication.id,
    connectionId: previewConnection.id,
    entryKind: "tool",
    toolName: "documents.read",
    title: "Read document",
    description: "Read one document.",
    inputSchema: null,
    outputSchema: null,
    annotations: null,
    riskLevel: "read",
    isReadOnly: true,
    isWrite: false,
    isDestructive: false,
    status: "active",
    addedAt: new Date("2026-08-20T08:00:00Z"),
    version: null,
    schemaHash: null,
    firstSeenAt: new Date("2026-08-20T08:00:00Z"),
    lastSeenAt: new Date("2026-09-14T08:00:00Z"),
    reviewedAt: new Date("2026-08-20T08:00:00Z"),
    reviewedByAgentId: null,
    reviewedByUserId: "user-board",
    createdAt: new Date("2026-08-20T08:00:00Z"),
    updatedAt: new Date("2026-09-14T08:00:00Z"),
  },
];

const previewGateway: ToolMcpGatewayWithTokens = {
  id: "warm-gateway",
  companyId: "company-storybook",
  gatewayPublicId: "gw_warm_workspace",
  name: "Workspace gateway",
  displaySlug: "workspace-gateway",
  slug: "workspace-gateway",
  description: "A scoped endpoint for workspace document tools.",
  status: "active",
  profileId: previewProfile.id,
  defaultProfileMode: "gateway_only",
  contextScopeType: "company",
  contextScopeId: "company-storybook",
  agentId: null,
  projectId: null,
  issueId: null,
  approvalIssueId: null,
  endpointPath: "/mcp/gateways/gw_warm_workspace",
  authConfig: {
    version: 1,
    bearer: { enabled: true, tokenPrefix: "pcgw", defaultTtlSeconds: 7776000, requireFiniteExpiry: true, longLivedTokenRequiresOverride: true },
    oauth: { enabled: false, reservedFor: "v1_5" },
  },
  headerPolicy: {
    version: 1,
    callerPassthrough: { enabled: false, allowedHeaders: [] },
    staticHeaders: [],
    generatedMetadata: { enabled: true, allowedHeaders: [] },
    responseHeaders: { forwardMcpRequiredHeaders: true, forwardSafeCacheHeaders: false },
  },
  metadataPolicy: {
    version: 1,
    forwardCompanyId: true,
    forwardGatewayId: true,
    forwardProjectId: false,
    forwardIssueId: false,
    forwardAgentId: true,
    forwardRunId: true,
    forwardCorrelationId: true,
  },
  onDemandToolsConfig: { enabled: false, searchToolName: "search_tools", runToolName: "run_tool" },
  metadata: null,
  createdByAgentId: null,
  createdByUserId: "user-board",
  archivedAt: null,
  createdAt: new Date("2026-08-20T08:00:00Z"),
  updatedAt: new Date("2026-09-14T08:00:00Z"),
  tokens: [{
    id: "warm-token",
    companyId: "company-storybook",
    gatewayId: "warm-gateway",
    name: "Workspace desktop",
    tokenPrefix: "pcgw",
    subjectType: "gateway_client",
    subjectId: null,
    clientLabel: "Desktop client",
    ownerNote: "Operations workstation",
    allowedActions: ["tools/list", "tools/call"],
    expiresAt: "2099-12-31T23:59:59.000Z",
    expiryOverrideReason: null,
    expiryOverrideByUserId: null,
    expiryOverrideByAgentId: null,
    expiryOverrideAt: null,
    lastUsedAt: "2026-09-14T09:00:00.000Z",
    revokedAt: null,
    createdByAgentId: null,
    createdByUserId: "user-board",
    createdAt: "2026-08-20T08:00:00.000Z",
    updatedAt: "2026-09-14T09:00:00.000Z",
  }],
  clientSnippets: [],
};

const previewActivity: ToolGatewayActivityResponse = {
  events: [{
    id: "warm-activity",
    companyId: "company-storybook",
    action: "tool.invoked",
    actorType: "agent",
    actorId: "warm-agent",
    entityType: "tool_invocation",
    entityId: "warm-invocation",
    details: {
      toolName: "documents.read",
      argumentsSummary: { summary: JSON.stringify({ documentId: "[redacted]" }) },
      resultSummary: { summary: JSON.stringify({ status: "available", content: "[redacted]" }) },
    },
    createdAt: "2026-09-14T09:00:00.000Z",
    agentId: "warm-agent",
    runId: "warm-run",
    applicationId: previewApplication.id,
    connectionId: previewConnection.id,
    agentDisplayName: "Sage",
    actorDisplayName: "Sage",
    appDisplayName: previewApplication.name,
    applicationDisplayName: previewApplication.name,
    connectionDisplayName: previewConnection.name,
    toolDisplayName: "Read document",
    lifecycleType: null,
    normalizedOutcome: "allowed",
    invocation: {
      id: "warm-invocation",
      toolName: "documents.read",
      status: "succeeded",
      policyDecision: "allow",
      approvalState: "not_required",
      argumentsSummary: { summary: JSON.stringify({ documentId: "[redacted]" }) },
      resultSummary: { summary: JSON.stringify({ status: "available", content: "[redacted]" }) },
      resultSizeBytes: 128,
      errorCode: null,
      errorMessage: null,
      startedAt: "2026-09-14T09:00:00.000Z",
      completedAt: "2026-09-14T09:00:00.042Z",
    },
  }],
  nextCursor: null,
};


const studioFiles: CompanySkillFileDetail[] = [
  { skillId: "warm-saved-skill", path: "SKILL.md", kind: "skill", content: "# Review checklist\n\nInspect the changed behavior before release.\n", language: "markdown", markdown: true, editable: true },
  { skillId: "warm-saved-skill", path: "references/checklist.txt", kind: "reference", content: "Verify keyboard focus and draft retention.\n", language: "text", markdown: false, editable: true },
];
const studioVersion: CompanySkillVersion = {
  id: "warm-version-2", companyId: "company-storybook", companySkillId: "warm-saved-skill",
  revisionNumber: 2, label: "Keyboard review", releaseId: null, releaseName: null, releasedAt: null,
  authorAgentId: null, authorUserId: null, createdAt: new Date("2026-09-14T08:00:00Z"),
  fileInventory: studioFiles.map(({ path, kind, content }) => ({ path, kind, content })),
};
const studioSkill: CompanySkillDetail = {
  ...library[1], id: "warm-saved-skill", name: "Workspace review", slug: "workspace-review",
  markdown: studioFiles[0].content, metadata: null, usedByAgents: [], attachedAgentCount: 0,
  existingForks: [], currentVersion: studioVersion, currentVersionId: studioVersion.id,
  fileInventory: studioFiles.map(({ path, kind }) => ({ path, kind })), starredByCurrentActor: false,
};
const studioInputs: CompanySkillTestInput[] = [{
  id: "warm-input", companyId: studioSkill.companyId, skillId: studioSkill.id,
  name: "review.md", content: "Review the mobile editor without running a skill.", createdBy: null,
  deletedAt: null, createdAt: studioVersion.createdAt, updatedAt: studioVersion.createdAt,
}];
const studioRun: CompanySkillTestRun = {
  id: "warm-run",
  companyId: "company-storybook",
  skillId: studioSkill.id,
  inputId: studioInputs[0].id,
  inputSnapshot: studioInputs[0].content,
  skillVersionId: studioVersion.id,
  agentId: "warm-agent",
  agentConfigSnapshot: { name: "Sage", title: "Operations agent" },
  issueId: "warm-run-issue",
  templateId: null,
  templateName: null,
  templateBody: null,
  renderedTemplateBody: null,
  harnessIssueDescription: "Read-only test run preview.",
  status: "succeeded",
  outputDocumentKey: "output.md",
  outputSnapshot: "Run output snapshot.",
  error: null,
  deletedAt: null,
  supersededAt: null,
  harnessIssueExpiresAt: null,
  harnessIssueDeletedAt: null,
  createdAt: new Date("2026-09-14T09:00:00Z"),
  updatedAt: new Date("2026-09-14T09:05:00Z"),
  cost: { costCents: 12, inputTokens: 120, cachedInputTokens: 0, outputTokens: 80 },
  taskExpired: false,
};
const studioRunDetail: CompanySkillTestRunDetail = {
  ...studioRun,
  outputBody: "## Verified output\n\nThe saved skill produced a read-only preview.",
  skillVersion: studioVersion,
  harnessContent: { available: true, unavailableReason: null, documents: [], attachments: [], workProducts: [] },
  harnessIssue: { id: "warm-run-issue", identifier: "RUN-1", title: "Skill test task", status: "done", hiddenAt: null },
  documents: [],
  interactions: [],
  artifacts: [],
};

function CatalogScenario({ page = "apps", streamlined = true, state = "populated", readOnly = false }: {
  page?: "apps" | "apps/connect" | "apps/review" | "apps/warm-connection/permissions" | "apps/warm-connected/permissions" | "apps/warm-connected/services" | "apps/gateways" | "apps/gateways/warm-gateway/overview" | "apps/gateways/warm-gateway/tokens" | "apps/gateways/warm-gateway/activity" | "apps/gateways/warm-gateway/advanced" | "apps/advanced/profiles" | "apps/advanced/profiles/new" | "apps/advanced/profiles/warm-profile" | "apps/advanced/profiles/warm-profile/edit" | "skills" | "skills/studio" | "skills/studio/new" | "skills/studio/sample-unavailable" | "skills/studio/warm-saved-skill";
  streamlined?: boolean;
  readOnly?: boolean;
  state?: "populated" | "empty" | "loading" | "error" | "refresh-error" | "services-refresh-error" | "connection-refresh-error" | "input-refresh-error" | "runs-refresh-error" | "versions-refresh-error" | "run-detail-error" | "run-detail-populated" | "policy-denied";
}) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPath] = useState(location.pathname);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const originalFetch = window.fetch;
    const requestCounts = new Map<string, number>();
    const key = queryKeys.instance.experimentalSettings;
    const previous = client.getQueryData(key);
    client.setQueryData(key, { enableStreamlinedUi: streamlined });
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (url.pathname === "/api/companies/company-storybook/skills/warm-saved-skill/test-runs" && state === "policy-denied") {
        return Response.json({
          error: "This run is restricted by the organization skill policy.",
          code: "skill_policy_denied",
          reason: "explicit_rule",
          remediation: "Ask an organization administrator to allow this skill test.",
        }, { status: 403 });
      }
      if (url.pathname.startsWith("/api/") && method !== "GET") return Response.json({ error: "This preview is read-only." }, { status: 403 });
      if (url.pathname === "/api/cli-auth/me") return Response.json({
        user: null, userId: "user-board", isInstanceAdmin: true, companyIds: ["company-storybook"], source: "session", keyId: null,
      } satisfies CurrentBoardAccess);
      if (url.pathname === "/api/health") return Response.json({ status: "ok", deploymentMode: "local_trusted" });
      if (url.pathname === "/api/instance/settings/general") return Response.json({ keyboardShortcuts: true });
      if (url.pathname === "/api/instance/settings/experimental") return Response.json({ enableStreamlinedUi: streamlined });
      const connectionPath = `/api/tool-connections/${previewConnection.id}`;
      if (url.pathname === "/api/companies/company-storybook/tools/gateways") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample gateways unavailable." }, { status: 503 });
        return Response.json({ gateways: page.includes("warm-gateway") ? [previewGateway] : [] });
      }
      if (url.pathname === "/api/companies/company-storybook/tools/applications") return Response.json({ applications: [previewApplication] });
      if (url.pathname === "/api/companies/company-storybook/tools/connections") return Response.json({ connections: [previewConnection] });
      if (url.pathname === "/api/companies/company-storybook/agents") return Response.json([{ id: "warm-agent", name: "Sage", title: "Operations agent", icon: null }]);
      if (url.pathname === "/api/companies/company-storybook/projects") return Response.json([]);
      if (url.pathname === "/api/companies/company-storybook/routines") return Response.json([]);
      if (url.pathname === "/api/tool-gateway/audit") return Response.json(previewActivity);
      if (url.pathname === `${connectionPath}/services`) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample services unavailable." }, { status: 503 });
        const requestCount = (requestCounts.get(url.pathname) ?? 0) + 1;
        requestCounts.set(url.pathname, requestCount);
        if (state === "services-refresh-error" && requestCount === 2) {
          return Response.json({ error: "Sample services refresh failed." }, { status: 503 });
        }
        return Response.json({ parentConnectionId: previewConnection.id, userId: "paperclip:company-storybook", services: state === "empty" ? [] : [{
          toolkit: { slug: "docs-preview", name: "Document service", meta: { description: "Read-only service metadata preview.", tools_count: 3 } },
          status: "connected", connectedAccountId: "account-preview", connectedAccountStatus: "ACTIVE", childConnectionId: "warm-connected",
        }] } satisfies ComposioServicesResponse);
      }
      if (url.pathname === connectionPath) {
        const requestCount = (requestCounts.get(url.pathname) ?? 0) + 1;
        requestCounts.set(url.pathname, requestCount);
        if (state === "connection-refresh-error" && requestCount === 2) {
          return Response.json({ error: "Sample connection refresh failed." }, { status: 503 });
        }
        return Response.json(previewConnection);
      }
      if (url.pathname === `${connectionPath}/grants`) return Response.json(previewGrants);
      if (url.pathname === `${connectionPath}/installs`) return Response.json({ connectionId: previewConnection.id, installs: [] });
      if (url.pathname === `${connectionPath}/catalog`) return Response.json({ catalog: previewTools });
      if (url.pathname === "/api/companies/company-storybook/tools/profiles") return Response.json({ profiles: page.includes("warm-profile") || page.includes("warm-gateway") ? [previewProfile] : [] });
      if (url.pathname === "/api/companies/company-storybook/tools/policies") return Response.json({ policies: [] });
      if (url.pathname === "/api/tool-connections/warm-connection") return Response.json({ error: "Sample connection could not be loaded." }, { status: 503 });
      if (url.pathname === "/api/companies/company-storybook/tools/action-requests") {
        if (state === "error") return Response.json({ error: "Sample connection reviews unavailable." }, { status: 503 });
        if (state === "loading") return new Promise<Response>(() => {});
        return Response.json({ actionRequests: [] });
      }
      if (url.pathname === "/api/skills/catalog") return Response.json([]);
      if (url.pathname === "/api/companies/company-storybook/skills") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample skills could not be loaded." }, { status: 503 });
        return Response.json(state === "empty" ? [] : library);
      }
      if (url.pathname === "/api/companies/company-storybook/folders") return Response.json({ kind: "skill", folders: [], allCount: state === "empty" ? 0 : library.length, unfiledCount: state === "empty" ? 0 : library.length });
      const studioPath = `/api/companies/company-storybook/skills/${studioSkill.id}`;
      if (url.pathname === studioPath) return Response.json({ ...studioSkill, editable: !readOnly, editableReason: readOnly ? "This sample is an external read-only skill." : null });
      if (url.pathname === `${studioPath}/files`) {
        const file = studioFiles.find((entry) => entry.path === url.searchParams.get("path"));
        const filePath = url.searchParams.get("path") ?? "";
        const requestCount = (requestCounts.get(url.href) ?? 0) + 1;
        requestCounts.set(url.href, requestCount);
        if (state === "refresh-error" && requestCount === 2) {
          return Response.json({ error: "Sample file refresh failed." }, { status: 503 });
        }
        return file ? Response.json({ ...file, editable: !readOnly }) : Response.json({ error: "Sample file not found." }, { status: 404 });
      }
      if (url.pathname === `${studioPath}/test-inputs`) {
        if (state === "error") return Response.json({ error: "Sample saved inputs unavailable." }, { status: 503 });
        const requestCount = (requestCounts.get(url.pathname) ?? 0) + 1;
        requestCounts.set(url.pathname, requestCount);
        if (state === "input-refresh-error" && requestCount === 2) {
          return Response.json({ error: "Sample saved inputs refresh failed." }, { status: 503 });
        }
        return Response.json(studioInputs);
      }
      if (url.pathname === `${studioPath}/test-runs/${studioRun.id}`) {
        const requestCount = (requestCounts.get(url.pathname) ?? 0) + 1;
        requestCounts.set(url.pathname, requestCount);
        if (state === "run-detail-error" && requestCount === 1) return Response.json({ error: "Sample run details unavailable." }, { status: 503 });
        if (state === "run-detail-error" || state === "run-detail-populated") return Response.json(studioRunDetail);
      }
      if (url.pathname === `${studioPath}/test-runs`) {
        if (state === "error") return Response.json({ error: "Sample run history unavailable." }, { status: 503 });
        const requestCount = (requestCounts.get(url.pathname) ?? 0) + 1;
        requestCounts.set(url.pathname, requestCount);
        if (state === "runs-refresh-error" && requestCount === 2) {
          return Response.json({ error: "Sample run history refresh failed." }, { status: 503 });
        }
        return Response.json(state === "runs-refresh-error" || state === "run-detail-error" || state === "run-detail-populated" ? [studioRun] : []);
      }
      if (url.pathname === `${studioPath}/versions` && state === "error") return Response.json({ error: "Sample version history unavailable." }, { status: 503 });
      if (url.pathname === `${studioPath}/versions`) {
        const requestCount = (requestCounts.get(url.pathname) ?? 0) + 1;
        requestCounts.set(url.pathname, requestCount);
        if (state === "versions-refresh-error" && requestCount === 2) {
          return Response.json({ error: "Sample version history refresh failed." }, { status: 503 });
        }
        return Response.json([
        studioVersion,
        { ...studioVersion, id: "warm-version-1", revisionNumber: 1, label: "Initial review", fileInventory: [{ ...studioVersion.fileInventory[0], content: "# Initial review\n" }] },
        ] satisfies CompanySkillVersion[]);
      }
      if (url.pathname === "/api/companies/company-storybook/skill-test-run-templates") return Response.json([]);
      if (url.pathname === "/api/companies/company-storybook/skills/sample-unavailable") return Response.json({ error: "Sample skill could not be loaded." }, { status: 503 });
      if (url.pathname.startsWith("/api/companies/company-storybook/skills/")) return Response.json({ error: "No fixture for this skill detail endpoint." }, { status: 501 });
      if (url.pathname === "/api/companies/company-storybook/tools/gallery" && state !== "populated") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample connectors could not be loaded." }, { status: 503 });
        return Response.json([]);
      }
      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      client.removeQueries({ queryKey: queryKeys.companySkills.list("company-storybook") });
      client.removeQueries({ queryKey: queryKeys.apps.gallery("company-storybook") });
      if (previous === undefined) client.removeQueries({ queryKey: key, exact: true });
      else client.setQueryData(key, previous);
    };
  }, [client, readOnly, state, streamlined]);
  useEffect(() => {
    if (location.pathname === initialPath) navigate(`/PAP/${page}`, { replace: true });
  }, [initialPath, location.pathname, navigate, page]);
  if (!ready) return null;
  return <PluginLauncherProvider><Routes>
    <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
      <Route path="apps" element={<Browse />} />
      <Route path="apps/connect" element={<AppsConnect />} />
      <Route path="apps/review" element={<AppsReview />} />
      <Route path="apps/advanced/profiles/new" element={<ProfileWizardRoute mode="new" />} />
      <Route path="apps/advanced/profiles/:profileId/edit" element={<ProfileWizardRoute mode="edit" />} />
      <Route path="apps/advanced/profiles/:profileId" element={<ProfileDetailRoute />} />
      <Route path="apps/advanced/:tab" element={<AdvancedToolsRoute />} />
      <Route path="apps/gateways" element={<GatewaysList />} />
      <Route path="apps/gateways/:gatewayId/:tab" element={<GatewayDetail />} />
      <Route path="apps/:connectionId/:tab" element={<AppDetail />} />
      <Route path="skills/studio" element={<SkillStudio />} />
      <Route path="skills/studio/new" element={<SkillStudio />} />
      <Route path="skills/studio/:skillId" element={<SkillStudio />} />
      <Route path="skills/*" element={streamlined ? <CompanySkills /> : <ProductionSkills />} />
      <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
    </Route>
  </Routes></PluginLauncherProvider>;
}
const meta = { title: "Pages/Warm Workspace/Catalogs", component: CatalogScenario, parameters: { layout: "fullscreen" } } satisfies Meta<typeof CatalogScenario>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Apps: Story = { args: {} };
export const Profiles: Story = { args: { page: "apps/advanced/profiles" } };
export const ProfileDetailPopulated: Story = { args: { page: "apps/advanced/profiles/warm-profile" } };
export const ProfileEditPopulated: Story = { args: { page: "apps/advanced/profiles/warm-profile/edit" } };
export const ProfileNew: Story = { args: { page: "apps/advanced/profiles/new" } };
export const GatewaysEmpty: Story = { args: { page: "apps/gateways" } };
export const GatewaysError: Story = { args: { page: "apps/gateways", state: "error" } };
export const GatewayOverviewPopulated: Story = { args: { page: "apps/gateways/warm-gateway/overview" } };
export const GatewayAppsPopulated: Story = { args: { page: "apps/gateways/warm-gateway/apps" } };
export const GatewayTokensPopulated: Story = { args: { page: "apps/gateways/warm-gateway/tokens" } };
export const GatewayActivityPopulated: Story = { args: { page: "apps/gateways/warm-gateway/activity" } };
export const GatewayAdvancedPopulated: Story = { args: { page: "apps/gateways/warm-gateway/advanced" } };
export const AppServices: Story = { args: { page: "apps/warm-connected/services" } };
export const AppServicesRefreshError: Story = { args: { page: "apps/warm-connected/services", state: "services-refresh-error" } };
export const AppServicesError: Story = { args: { page: "apps/warm-connected/services", state: "error" } };
export const AppServicesEmpty: Story = { args: { page: "apps/warm-connected/services", state: "empty" } };
export const AppDetailReadOnly: Story = { args: { page: "apps/warm-connected/permissions" } };
export const AppDetailLoadError: Story = { args: { page: "apps/warm-connection/permissions" } };
export const AppDetailRefreshError: Story = { args: { page: "apps/warm-connected/permissions", state: "connection-refresh-error" } };
export const AppsReviewEmpty: Story = { args: { page: "apps/review", state: "empty" } };
export const AppsReviewError: Story = { args: { page: "apps/review", state: "error" } };
export const AppsConnectForm: Story = { args: { page: "apps/connect" } };
export const AppsError: Story = { args: { state: "error" } };
export const SkillStudioHistoryError: Story = { args: { page: "skills/studio/warm-saved-skill", state: "error" } };
export const SkillStudioSaved: Story = { args: { page: "skills/studio/warm-saved-skill" } };
export const SkillStudioSavedRefreshError: Story = { args: { page: "skills/studio/warm-saved-skill", state: "refresh-error" } };
export const SkillStudioInputRefreshError: Story = { args: { page: "skills/studio/warm-saved-skill", state: "input-refresh-error" } };
export const SkillStudioRunsRefreshError: Story = { args: { page: "skills/studio/warm-saved-skill", state: "runs-refresh-error" } };
export const SkillStudioVersionsRefreshError: Story = { args: { page: "skills/studio/warm-saved-skill", state: "versions-refresh-error" } };
export const SkillStudioRunDetailError: Story = { args: { page: "skills/studio/warm-saved-skill", state: "run-detail-error" } };
export const SkillStudioRunDetailPopulated: Story = { args: { page: "skills/studio/warm-saved-skill", state: "run-detail-populated" } };
export const SkillStudioPolicyDenied: Story = { args: { page: "skills/studio/warm-saved-skill", state: "policy-denied" } };
export const SkillStudioSavedProduction: Story = { args: { page: "skills/studio/warm-saved-skill", streamlined: false } };
export const SkillStudioReadOnly: Story = { args: { page: "skills/studio/warm-saved-skill", readOnly: true } };
export const SkillStudioLoadError: Story = { args: { page: "skills/studio/sample-unavailable" } };
export const SkillStudioLanding: Story = { args: { page: "skills/studio" } };
export const SkillStudioNew: Story = { args: { page: "skills/studio/new" } };
export const SkillStudioNewProduction: Story = { args: { page: "skills/studio/new", streamlined: false } };
export const Skills: Story = { args: { page: "skills" } };
export const SkillsProduction: Story = { args: { page: "skills", streamlined: false } };
export const SkillsEmpty: Story = { args: { page: "skills", state: "empty" } };
export const SkillsLoading: Story = { args: { page: "skills", state: "loading" } };
export const SkillsError: Story = { args: { page: "skills", state: "error" } };
