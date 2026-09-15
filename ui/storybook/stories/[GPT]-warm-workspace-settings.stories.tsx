import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";
import { Routes, Route, useNavigate, useLocation } from "@/lib/router";
import { Layout } from "@/components/Layout";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { HiddenSettingsPageGate } from "@/components/HiddenSettingsPageGate";
import { CompanySettings } from "@/pages/CompanySettings";
import { ProfileSettings } from "@/pages/ProfileSettings";
import { CompanyAccess } from "@/pages/CompanyAccess";
import { CompanyEnvironments } from "@/pages/CompanyEnvironments";
import { PluginSettings } from "@/pages/PluginSettings";
import type { Environment, EnvironmentCapabilities, PluginRecord } from "@paperclipai/shared";
import type { PluginDashboardData, PluginHealthCheckResult } from "@/api/plugins";
import { AdapterManager } from "@/pages/AdapterManager";
import { PluginManager } from "@/pages/PluginManager";
import { InstanceAccess } from "@/pages/InstanceAccess";
import { InstanceExperimentalSettings } from "@/pages/InstanceExperimentalSettings";
import { Secrets } from "@/pages/Secrets";
import type { AdminUserDirectoryEntry, UserCompanyAccessResponse, CompanyMembersResponse } from "@/api/access";
import { queryKeys } from "@/lib/queryKeys";

const previewPlugin: PluginRecord = {
  id: "warm-settings-plugin", pluginKey: "example.settings-preview", packageName: "@example/settings-preview",
  version: "1.0.0", apiVersion: 1, status: "ready", categories: ["automation"], installOrder: null,
  packagePath: null, lastError: null, installedAt: new Date("2026-09-14"), updatedAt: new Date("2026-09-14"),
  manifestJson: { id: "example.settings-preview", apiVersion: 1, version: "1.0.0", displayName: "Settings sample",
    description: "Read-only host settings preview.", author: "Preview", categories: ["automation"], capabilities: ["issues.read"],
    entrypoints: { worker: "unused-preview.js" },
    instanceConfigSchema: { type: "object", properties: { label: { type: "string", title: "Label" } } },
  },
};
const previewEnvironments: Environment[] = [
  {
    id: "environment-local",
    name: "Local host",
    description: "Runs on this Paperclip host.",
    driver: "local",
    status: "active",
    config: {},
    envVars: {},
    metadata: null,
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-14T00:00:00Z"),
  },
  {
    id: "environment-ssh",
    name: "Review workstation",
    description: "Remote workspace for release reviews.",
    driver: "ssh",
    status: "active",
    config: { host: "review.example.invalid", port: 22, username: "reviewer", remoteWorkspacePath: "/srv/review", privateKey: null, privateKeySecretRef: null, knownHosts: null, strictHostKeyChecking: true },
    envVars: {},
    metadata: null,
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-14T00:00:00Z"),
  },
  {
    id: "environment-sandbox",
    name: "Daytona preview",
    description: "Disposable browser-test environment.",
    driver: "sandbox",
    status: "active",
    config: { provider: "daytona", image: "node-25", reuseLease: true, streamRunLogs: true },
    envVars: {},
    metadata: null,
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-14T00:00:00Z"),
  },
];

const previewEnvironmentCapabilities: EnvironmentCapabilities = {
  adapters: [],
  drivers: { local: "supported", ssh: "supported", sandbox: "supported", plugin: "unsupported" },
  sandboxProviders: {
    fake: {
      status: "unsupported", supportsSavedProbe: false, supportsUnsavedProbe: false, supportsRunExecution: false,
      supportsReusableLeases: false, supportsInteractiveSetup: false, interactiveSetupConnectionTypes: [],
      supportsTemplateCapture: false, supportsTemplateDelete: false, supportsLoginPty: false,
      displayName: "Fake", source: "builtin",
    },
    daytona: {
      status: "supported", supportsSavedProbe: true, supportsUnsavedProbe: true, supportsRunExecution: true,
      supportsReusableLeases: true, supportsInteractiveSetup: false, interactiveSetupConnectionTypes: [],
      supportsTemplateCapture: false, supportsTemplateDelete: false, supportsLoginPty: false,
      displayName: "Daytona", description: "Disposable sandbox provider for isolated runs.", source: "plugin",
      pluginKey: "example.daytona", pluginId: "plugin-daytona",
      configSchema: { type: "object", properties: { image: { type: "string", title: "Image", default: "node-25" } }, required: ["image"] },
    },
  },
};

const previewPluginHealth: PluginHealthCheckResult = {
  pluginId: previewPlugin.id,
  status: "ready",
  healthy: false,
  checks: [{ name: "Worker heartbeat", passed: true }, { name: "Webhook queue", passed: false, message: "One sample delivery failed." }],
  lastError: "One sample delivery failed.",
};

const previewPluginDashboard: PluginDashboardData = {
  pluginId: previewPlugin.id,
  worker: { status: "running", pid: 4321, uptime: 3723000, consecutiveCrashes: 0, totalCrashes: 1, pendingRequests: 2, lastCrashAt: Date.parse("2026-09-13T00:00:00Z"), nextRestartAt: null },
  recentJobRuns: [{ id: "job-run-preview", jobId: "job-preview", jobKey: "nightly-review", trigger: "schedule", status: "succeeded", durationMs: 4200, error: null, startedAt: "2026-09-14T08:00:00Z", finishedAt: "2026-09-14T08:00:04.200Z", createdAt: "2026-09-14T08:00:00Z" }],
  recentWebhookDeliveries: [{ id: "delivery-preview", webhookKey: "review.created", status: "failed", durationMs: 250, error: "Sample endpoint unavailable.", startedAt: "2026-09-14T08:02:00Z", finishedAt: "2026-09-14T08:02:00.250Z", createdAt: "2026-09-14T08:02:00Z" }],
  health: previewPluginHealth,
  checkedAt: "2026-09-14T08:03:00Z",
};
const adminUsers: AdminUserDirectoryEntry[] = [{
  id: "user-board", name: "Board Operator", email: "board@paperclip.local", image: null,
  isInstanceAdmin: true, activeCompanyMembershipCount: 1,
}];
const userAccess: UserCompanyAccessResponse = {
  user: adminUsers[0], companyAccess: [{
    id: "access-preview", companyId: "company-storybook", principalType: "user", principalId: "user-board",
    status: "active", membershipRole: "owner", createdAt: "2026-09-14T00:00:00Z", updatedAt: "2026-09-14T00:00:00Z",
    companyName: "Paperclip", companyStatus: "active",
  }],
};

const members: CompanyMembersResponse = {
  members: [{ id: "member-preview", companyId: "company-storybook", principalType: "user", principalId: "user-board",
    status: "active", membershipRole: "owner", createdAt: "2026-09-14T00:00:00Z", updatedAt: "2026-09-14T00:00:00Z",
    user: { id: "user-board", email: "board@paperclip.local", name: "Board Operator", image: null }, grants: [],
    removal: { canArchive: false, reason: "The last owner cannot be removed." },
  }, { id: "member-preview-editor", companyId: "company-storybook", principalType: "user", principalId: "user-preview-editor",
    status: "active", membershipRole: "operator", createdAt: "2026-09-14T00:00:00Z", updatedAt: "2026-09-14T00:00:00Z",
    user: { id: "user-preview-editor", email: "editor@paperclip.local", name: "Preview Member", image: null }, grants: [],
    removal: { canArchive: true, reason: null },
  }],
  access: { currentUserRole: "owner", canManageMembers: true, canInviteUsers: true, canApproveJoinRequests: false },
};

function SettingsScenario({ profile = false, membersPage = false, secretsPage = false, experimentalPage = false, instanceAccessPage = false, pluginsPage = false, pluginDetails = false, adaptersPage = false, environmentsPage = false, environmentMode = "list", hiddenMembers = false, state = "populated" }: {
  profile?: boolean;
  membersPage?: boolean;
  secretsPage?: boolean;
  experimentalPage?: boolean;
  instanceAccessPage?: boolean;
  pluginsPage?: boolean;
  pluginDetails?: boolean;
  adaptersPage?: boolean;
  environmentsPage?: boolean;
  environmentMode?: "list" | "create" | "edit";
  hiddenMembers?: boolean;
  state?: "populated" | "empty" | "loading" | "error" | "forbidden" | "retry" | "diagnosticsError";
}) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPath] = useState(location.pathname);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let secretReadFailed = false;
    const originalFetch = window.fetch;
    const key = queryKeys.instance.experimentalSettings;
    const previousHealth = client.getQueryData(queryKeys.health);
    const previous = client.getQueryData(key);
    client.setQueryData(key, { enableStreamlinedUi: true, enableEnvironments: environmentsPage });
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (url.pathname.startsWith("/api/") && method !== "GET") return Response.json({ error: "This preview is read-only." }, { status: 403 });
      if (url.pathname === "/api/health") return Response.json({ status: "ok", deploymentMode: "local_trusted", hiddenSettings: hiddenMembers ? ["company.members"] : [] });
      if (environmentsPage && url.pathname === "/api/companies/company-storybook/environments") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample environments unavailable." }, { status: 503 });
        return Response.json(state === "empty" ? [] : previewEnvironments);
      }
      if (environmentsPage && url.pathname === "/api/companies/company-storybook/environments/capabilities") return Response.json(previewEnvironmentCapabilities);
      if (environmentsPage && url.pathname === "/api/environments/environment-ssh/secret-refs") return Response.json({ refs: [] });
      if (environmentsPage && url.pathname === "/api/environments/environment-sandbox/secret-refs") return Response.json({ refs: [] });
      if (environmentsPage && url.pathname === "/api/instance/settings") return Response.json({ defaultEnvironmentId: "environment-ssh" });
      if (url.pathname === `/api/plugins/${previewPlugin.id}`) {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample plugin details unavailable." }, { status: 503 });
        return Response.json(previewPlugin);
      }
      if (url.pathname === `/api/plugins/${previewPlugin.id}/dashboard`) {
        if (state === "diagnosticsError") return Response.json({ error: "Sample dashboard unavailable." }, { status: 503 });
        return Response.json(previewPluginDashboard);
      }
      if (url.pathname === `/api/plugins/${previewPlugin.id}/health`) {
        if (state === "diagnosticsError") return Response.json({ error: "Sample health unavailable." }, { status: 503 });
        return Response.json(previewPluginHealth);
      }
      if (url.pathname === `/api/plugins/${previewPlugin.id}/logs`) {
        if (state === "diagnosticsError") return Response.json({ error: "Sample logs unavailable." }, { status: 503 });
        return Response.json([{ id: "plugin-log-preview", pluginId: previewPlugin.id, level: "warn", message: "Sample queue retry scheduled.", meta: null, createdAt: "2026-09-14T08:04:00Z" }]);
      }
      if (url.pathname === `/api/plugins/${previewPlugin.id}/config`) return state === "forbidden"
        ? Response.json({ error: "Sample configuration unavailable." }, { status: 403 })
        : Response.json({ configJson: { label: "Operations preview" } });
      if (adaptersPage && url.pathname === "/api/adapters" && state !== "populated") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample adapter list unavailable." }, { status: 503 });
        return Response.json([]);
      }
      if (pluginsPage && url.pathname === "/api/plugins") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample plugin list unavailable." }, { status: 503 });
        return Response.json([]);
      }
      if (pluginsPage && url.pathname === "/api/plugins/examples") return Response.json([]);
      if (url.pathname === "/api/admin/users") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error" || state === "forbidden") return Response.json({ error: "Sample user directory unavailable." }, { status: state === "forbidden" ? 403 : 503 });
        const query = (url.searchParams.get("query") ?? "").toLowerCase();
        return Response.json(state === "empty" ? [] : adminUsers.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query)));
      }
      if (url.pathname === "/api/admin/users/user-board/company-access") return Response.json(userAccess);
      if (url.pathname === "/api/instance/settings/general") return Response.json({ keyboardShortcuts: true });
      if (url.pathname === "/api/instance/settings/experimental") return Response.json({ enableStreamlinedUi: true, enableEnvironments: environmentsPage });
      if (url.pathname === "/api/companies/company-storybook/issues" && url.searchParams.get("assigneeUserId") === "user-preview-editor") return Response.json([]);
      if (url.pathname === "/api/companies/company-storybook/members") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error" || state === "forbidden") return Response.json({ error: "Sample members could not be loaded." }, { status: state === "forbidden" ? 403 : 503 });
        return Response.json(state === "empty" ? { ...members, members: [] } : members);
      }
      if (["/api/companies/company-storybook/user-secret-definitions", "/api/companies/company-storybook/me/user-secrets", "/api/companies/company-storybook/secret-proposals"].includes(url.pathname)) return Response.json([]);
      if (secretsPage && url.pathname === "/api/companies/company-storybook/secrets" && state !== "populated") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "retry") {
          if (secretReadFailed) return originalFetch(input, init);
          secretReadFailed = true;
          return Response.json({ error: "Sample secret metadata could not be loaded." }, { status: 503 });
        }
        if (state === "error") return Response.json({ error: "Sample secret metadata could not be loaded." }, { status: 503 });
        return Response.json([]);
      }
      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      if (previousHealth === undefined) client.removeQueries({ queryKey: queryKeys.health, exact: true });
      else client.setQueryData(queryKeys.health, previousHealth);
      client.removeQueries({ queryKey: queryKeys.access.companyMembers("company-storybook") });
      if (secretsPage) {
        client.removeQueries({ queryKey: queryKeys.secrets.list("company-storybook") });
        client.removeQueries({ queryKey: queryKeys.secrets.userDefinitions("company-storybook") });
        client.removeQueries({ queryKey: queryKeys.secrets.myUserSecrets("company-storybook") });
      }
      if (previous === undefined) client.removeQueries({ queryKey: key, exact: true });
      else client.setQueryData(key, previous);
    };
  }, [client, state, hiddenMembers, secretsPage, pluginsPage, adaptersPage, environmentsPage]);
  useEffect(() => {
    const environmentSuffix = environmentMode === "create"
      ? "/instance/environments/new"
      : environmentMode === "edit"
        ? "/instance/environments/environment-ssh/edit"
        : "/instance/environments";
    if (location.pathname === initialPath) navigate(`/PAP/company/settings${environmentsPage ? environmentSuffix : pluginDetails ? `/instance/plugins/${previewPlugin.id}` : adaptersPage ? "/instance/adapters" : pluginsPage ? "/instance/plugins" : instanceAccessPage ? "/instance/access" : experimentalPage ? "/instance/experimental" : secretsPage ? "/secrets" : membersPage ? "/members" : profile ? "/instance/profile" : ""}`, { replace: true });
  }, [initialPath, location.pathname, navigate, profile, membersPage, secretsPage, experimentalPage, instanceAccessPage, pluginsPage, pluginDetails, adaptersPage, environmentsPage, environmentMode]);
  if (!ready) return null;
  return <PluginLauncherProvider><Routes>
    <Route path="/:companyPrefix" element={<Layout />}>
      <Route path="company/settings" element={<CompanySettings />} />
      <Route element={<HiddenSettingsPageGate pageKey="instance.environments" />}>
        <Route path="company/settings/instance/environments" element={<CompanyEnvironments />} />
        <Route path="company/settings/instance/environments/new" element={<CompanyEnvironments mode="create" />} />
        <Route path="company/settings/instance/environments/:environmentId/edit" element={<CompanyEnvironments mode="edit" />} />
      </Route>
      <Route element={<HiddenSettingsPageGate pageKey="instance.adapters" />}>
        <Route path="company/settings/instance/adapters" element={<AdapterManager />} />
      </Route>
      <Route element={<HiddenSettingsPageGate pageKey="instance.plugins" />}>
        <Route path="company/settings/instance/plugins" element={<PluginManager />} />
        <Route path="company/settings/instance/plugins/:pluginId" element={<PluginSettings />} />
      </Route>
      <Route element={<HiddenSettingsPageGate pageKey="instance.access" />}>
        <Route path="company/settings/instance/access" element={<InstanceAccess />} />
      </Route>
      <Route element={<HiddenSettingsPageGate pageKey="instance.experimental" />}>
        <Route path="company/settings/instance/experimental" element={<InstanceExperimentalSettings />} />
      </Route>
      <Route element={<HiddenSettingsPageGate pageKey="company.secrets" />}>
        <Route path="company/settings/secrets" element={<Secrets />} />
      </Route>
      <Route element={<HiddenSettingsPageGate pageKey="company.members" />}>
        <Route path="company/settings/members" element={<CompanyAccess />} />
      </Route>
      <Route element={<HiddenSettingsPageGate pageKey="instance.profile" />}>
        <Route path="company/settings/instance/profile" element={<ProfileSettings />} />
      </Route>
      <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
    </Route>
  </Routes></PluginLauncherProvider>;
}
const meta = { title: "Pages/Warm Workspace/Settings", component: SettingsScenario, parameters: { layout: "fullscreen" } } satisfies Meta<typeof SettingsScenario>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EnvironmentsEmpty: Story = { args: { environmentsPage: true, state: "empty" } };
export const EnvironmentsPopulated: Story = { args: { environmentsPage: true } };
export const EnvironmentCreatePopulated: Story = { args: { environmentsPage: true, environmentMode: "create" } };
export const EnvironmentEditPopulated: Story = { args: { environmentsPage: true, environmentMode: "edit" } };
export const EnvironmentsError: Story = { args: { environmentsPage: true, state: "error" } };
export const EnvironmentsLoading: Story = { args: { environmentsPage: true, state: "loading" } };
export const PluginDetails: Story = { args: { pluginDetails: true } };
export const PluginDiagnosticsError: Story = { args: { pluginDetails: true, state: "diagnosticsError" } };
export const PluginDetailsError: Story = { args: { pluginDetails: true, state: "error" } };
export const PluginConfigError: Story = { args: { pluginDetails: true, state: "forbidden" } };
export const AdaptersPage: Story = { args: { adaptersPage: true } };
export const AdaptersError: Story = { args: { adaptersPage: true, state: "error" } };
export const AdaptersLoading: Story = { args: { adaptersPage: true, state: "loading" } };
export const PluginsEmpty: Story = { args: { pluginsPage: true } };
export const PluginsLoading: Story = { args: { pluginsPage: true, state: "loading" } };
export const PluginsError: Story = { args: { pluginsPage: true, state: "error" } };
export const Company: Story = { args: {} };
export const InstanceAccessPage: Story = { args: { instanceAccessPage: true } };
export const InstanceAccessForbidden: Story = { args: { instanceAccessPage: true, state: "forbidden" } };
export const InstanceAccessError: Story = { args: { instanceAccessPage: true, state: "error" } };
export const InstanceAccessEmpty: Story = { args: { instanceAccessPage: true, state: "empty" } };
export const InstanceAccessLoading: Story = { args: { instanceAccessPage: true, state: "loading" } };
export const Experimental: Story = { args: { experimentalPage: true } };
export const Profile: Story = { args: { profile: true } };
export const SecretsMetadata: Story = { args: { secretsPage: true } };
export const SecretsEmpty: Story = { args: { secretsPage: true, state: "empty" } };
export const SecretsLoading: Story = { args: { secretsPage: true, state: "loading" } };
export const SecretsRetry: Story = { args: { secretsPage: true, state: "retry" } };
export const SecretsError: Story = { args: { secretsPage: true, state: "error" } };
export const Members: Story = { args: { membersPage: true } };
export const MembersHidden: Story = { args: { membersPage: true, hiddenMembers: true } };
export const MembersEmpty: Story = { args: { membersPage: true, state: "empty" } };
export const MembersLoading: Story = { args: { membersPage: true, state: "loading" } };
export const MembersError: Story = { args: { membersPage: true, state: "error" } };
export const MembersForbidden: Story = { args: { membersPage: true, state: "forbidden" } };
