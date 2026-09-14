import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { Browse } from "@/pages/apps/Browse";
import { CompanySkills } from "@/pages/CompanySkills";
import { CompanySkills as ProductionSkills } from "@/pages/CompanySkills.production";
import { queryKeys } from "@/lib/queryKeys";
import { library } from "../prototypes/agent-settings/fixtures";

function CatalogScenario({ page = "apps", streamlined = true, state = "populated" }: {
  page?: "apps" | "skills";
  streamlined?: boolean;
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
      if (url.pathname === "/api/health") return Response.json({ status: "ok", deploymentMode: "local_trusted" });
      if (url.pathname === "/api/instance/settings/general") return Response.json({ keyboardShortcuts: true });
      if (url.pathname === "/api/instance/settings/experimental") return Response.json({ enableStreamlinedUi: streamlined });
      if (url.pathname === "/api/skills/catalog") return Response.json([]);
      if (url.pathname === "/api/companies/company-storybook/skills") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample skills could not be loaded." }, { status: 503 });
        return Response.json(state === "empty" ? [] : library);
      }
      if (url.pathname === "/api/companies/company-storybook/folders") return Response.json({ kind: "skill", folders: [], allCount: state === "empty" ? 0 : library.length, unfiledCount: state === "empty" ? 0 : library.length });
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
  }, [client, state, streamlined]);
  useEffect(() => {
    if (location.pathname === initialPath) navigate(`/PAP/${page}`, { replace: true });
  }, [initialPath, location.pathname, navigate, page]);
  if (!ready) return null;
  return <PluginLauncherProvider><Routes>
    <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
      <Route path="apps" element={<Browse />} />
      <Route path="skills/*" element={streamlined ? <CompanySkills /> : <ProductionSkills />} />
      <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
    </Route>
  </Routes></PluginLauncherProvider>;
}
const meta = { title: "Pages/Warm Workspace/Catalogs", component: CatalogScenario, parameters: { layout: "fullscreen" } } satisfies Meta<typeof CatalogScenario>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Apps: Story = { args: {} };
export const AppsError: Story = { args: { state: "error" } };
export const Skills: Story = { args: { page: "skills" } };
export const SkillsProduction: Story = { args: { page: "skills", streamlined: false } };
export const SkillsEmpty: Story = { args: { page: "skills", state: "empty" } };
export const SkillsLoading: Story = { args: { page: "skills", state: "loading" } };
export const SkillsError: Story = { args: { page: "skills", state: "error" } };
