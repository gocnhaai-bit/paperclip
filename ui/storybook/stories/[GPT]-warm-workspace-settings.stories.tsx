import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";
import { Routes, Route, useNavigate, useLocation } from "@/lib/router";
import { Layout } from "@/components/Layout";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { HiddenSettingsPageGate } from "@/components/HiddenSettingsPageGate";
import { CompanySettings } from "@/pages/CompanySettings";
import { ProfileSettings } from "@/pages/ProfileSettings";
import { queryKeys } from "@/lib/queryKeys";

function SettingsScenario({ profile = false }: { profile?: boolean }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPath] = useState(location.pathname);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const originalFetch = window.fetch;
    const key = queryKeys.instance.experimentalSettings;
    const previous = client.getQueryData(key);
    client.setQueryData(key, { enableStreamlinedUi: true });
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (url.pathname.startsWith("/api/") && method !== "GET") return Response.json({ error: "This preview is read-only." }, { status: 403 });
      if (url.pathname === "/api/health") return Response.json({ status: "ok", deploymentMode: "local_trusted", hiddenSettingsPages: [] });
      if (url.pathname === "/api/instance/settings/general") return Response.json({ keyboardShortcuts: true });
      if (url.pathname === "/api/instance/settings/experimental") return Response.json({ enableStreamlinedUi: true });
      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      if (previous === undefined) client.removeQueries({ queryKey: key, exact: true });
      else client.setQueryData(key, previous);
    };
  }, [client]);
  useEffect(() => {
    if (location.pathname === initialPath) navigate(`/PAP/company/settings${profile ? "/instance/profile" : ""}`, { replace: true });
  }, [initialPath, location.pathname, navigate, profile]);
  if (!ready) return null;
  return <PluginLauncherProvider><Routes>
    <Route path="/:companyPrefix" element={<Layout />}>
      <Route path="company/settings" element={<CompanySettings />} />
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
export const Company: Story = { args: {} };
export const Profile: Story = { args: { profile: true } };
