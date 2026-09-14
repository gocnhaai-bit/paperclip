import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import type { CurrentBoardAccess } from "@/api/access";
import { AdvancedToolsRoute } from "@/pages/tools/AdvancedToolsRoute";
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
import type { ConnectionGrantsResponse, ToolConnection, CompanySkillDetail, CompanySkillFileDetail, CompanySkillTestInput, CompanySkillVersion } from "@paperclipai/shared";
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

function CatalogScenario({ page = "apps", streamlined = true, state = "populated", readOnly = false }: {
  page?: "apps" | "apps/connect" | "apps/review" | "apps/warm-connection/permissions" | "apps/warm-connected/permissions" | "apps/warm-connected/services" | "apps/gateways" | "apps/advanced/profiles" | "apps/advanced/profiles/new" | "skills" | "skills/studio" | "skills/studio/new" | "skills/studio/sample-unavailable" | "skills/studio/warm-saved-skill";
  streamlined?: boolean;
  readOnly?: boolean;
  state?: "populated" | "empty" | "loading" | "error";
}) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPath] = useState(location.pathname);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const originalFetch = window.fetch;
    const key = queryKeys.instance.experimentalSettings;
    const previous = client.getQueryData(key);
    client.setQueryData(key, { enableStreamlinedUi: streamlined });
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
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
        return Response.json({ gateways: [] });
      }
      if (url.pathname === `${connectionPath}/services`) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample services unavailable." }, { status: 503 });
        return Response.json({ parentConnectionId: previewConnection.id, userId: "paperclip:company-storybook", services: state === "empty" ? [] : [{
          toolkit: { slug: "docs-preview", name: "Document service", meta: { description: "Read-only service metadata preview.", tools_count: 3 } },
          status: "connected", connectedAccountId: "account-preview", connectedAccountStatus: "ACTIVE", childConnectionId: "warm-connected",
        }] } satisfies ComposioServicesResponse);
      }
      if (url.pathname === connectionPath) return Response.json(previewConnection);
      if (url.pathname === `${connectionPath}/grants`) return Response.json(previewGrants);
      if (url.pathname === `${connectionPath}/installs`) return Response.json({ connectionId: previewConnection.id, installs: [] });
      if (url.pathname === `${connectionPath}/catalog`) return Response.json({ catalog: [] });
      if (url.pathname === "/api/companies/company-storybook/tools/profiles") return Response.json({ profiles: [] });
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
        return file ? Response.json({ ...file, editable: !readOnly }) : Response.json({ error: "Sample file not found." }, { status: 404 });
      }
      if (url.pathname === `${studioPath}/test-inputs`) return state === "error"
        ? Response.json({ error: "Sample saved inputs unavailable." }, { status: 503 })
        : Response.json(studioInputs);
      if (url.pathname === `${studioPath}/test-runs`) return state === "error"
        ? Response.json({ error: "Sample run history unavailable." }, { status: 503 })
        : Response.json([]);
      if (url.pathname === `${studioPath}/versions` && state === "error") return Response.json({ error: "Sample version history unavailable." }, { status: 503 });
      if (url.pathname === `${studioPath}/versions`) return Response.json([
        studioVersion,
        { ...studioVersion, id: "warm-version-1", revisionNumber: 1, label: "Initial review", fileInventory: [{ ...studioVersion.fileInventory[0], content: "# Initial review\n" }] },
      ] satisfies CompanySkillVersion[]);
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
      <Route path="apps/advanced/:tab" element={<AdvancedToolsRoute />} />
      <Route path="apps/advanced/profiles/new" element={<ProfileWizardRoute mode="new" />} />
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
export const ProfileNew: Story = { args: { page: "apps/advanced/profiles/new" } };
export const GatewaysEmpty: Story = { args: { page: "apps/gateways" } };
export const GatewaysError: Story = { args: { page: "apps/gateways", state: "error" } };
export const AppServices: Story = { args: { page: "apps/warm-connected/services" } };
export const AppServicesError: Story = { args: { page: "apps/warm-connected/services", state: "error" } };
export const AppServicesEmpty: Story = { args: { page: "apps/warm-connected/services", state: "empty" } };
export const AppDetailReadOnly: Story = { args: { page: "apps/warm-connected/permissions" } };
export const AppDetailLoadError: Story = { args: { page: "apps/warm-connection/permissions" } };
export const AppsReviewEmpty: Story = { args: { page: "apps/review", state: "empty" } };
export const AppsReviewError: Story = { args: { page: "apps/review", state: "error" } };
export const AppsConnectForm: Story = { args: { page: "apps/connect" } };
export const AppsError: Story = { args: { state: "error" } };
export const SkillStudioHistoryError: Story = { args: { page: "skills/studio/warm-saved-skill", state: "error" } };
export const SkillStudioSaved: Story = { args: { page: "skills/studio/warm-saved-skill" } };
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
