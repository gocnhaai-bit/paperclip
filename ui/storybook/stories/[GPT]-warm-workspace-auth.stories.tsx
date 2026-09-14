import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { AuthPage } from "@/pages/Auth";
import { NotFoundPage } from "@/pages/NotFound";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";

function AuthScenario({ page = "auth", streamlined = true }: {
  page?: "auth" | "board" | "global" | "invalid_company_prefix";
  streamlined?: boolean;
}) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPath] = useState(location.pathname);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const originalFetch = window.fetch;
    const settingsKey = queryKeys.instance.experimentalSettings;
    const previousSettings = client.getQueryData(settingsKey);
    const previousSession = client.getQueryData(queryKeys.auth.session);
    client.setQueryData(settingsKey, { enableStreamlinedUi: streamlined });
    if (page === "auth") client.setQueryData(queryKeys.auth.session, null);
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (url.pathname.startsWith("/api/") && method !== "GET") return Response.json({ error: "This preview is read-only." }, { status: 403 });
      if (url.pathname === "/api/auth/get-session" && page === "auth") return Response.json(null);
      if (url.pathname === "/api/health") return Response.json({ status: "ok", deploymentMode: "authenticated", deploymentExposure: "private" });
      if (url.pathname === "/api/instance/settings/general") return Response.json({ keyboardShortcuts: true });
      if (url.pathname === "/api/instance/settings/experimental") return Response.json({ enableStreamlinedUi: streamlined });
      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      if (previousSettings === undefined) client.removeQueries({ queryKey: settingsKey, exact: true });
      else client.setQueryData(settingsKey, previousSettings);
      if (previousSession === undefined) client.removeQueries({ queryKey: queryKeys.auth.session, exact: true });
      else client.setQueryData(queryKeys.auth.session, previousSession);
    };
  }, [client, page, streamlined]);
  useEffect(() => {
    if (location.pathname === initialPath) navigate(page === "auth" ? "/auth" : page === "board" ? "/PAP/missing-page" : "/missing-page", { replace: true });
  }, [initialPath, location.pathname, navigate, page]);
  if (!ready) return null;
  return <PluginLauncherProvider><Routes>
    <Route path="auth" element={<AuthPage />} />
    <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
      <Route path="missing-page" element={<NotFoundPage scope="board" />} />
    </Route>
    <Route path="*" element={page === "auth" ? <p>Preview navigation: {location.pathname}</p> : <NotFoundPage scope={page} requestedPrefix="missing" />} />
  </Routes></PluginLauncherProvider>;
}
const meta = { title: "Pages/Warm Workspace/Auth", component: AuthScenario, parameters: { layout: "fullscreen" } } satisfies Meta<typeof AuthScenario>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SignInForm: Story = { args: {} };
export const NotFoundBoard: Story = { args: { page: "board" } };
export const NotFoundBoardProduction: Story = { args: { page: "board", streamlined: false } };
export const NotFoundGlobal: Story = { args: { page: "global" } };
export const NotFoundInvalidPrefix: Story = { args: { page: "invalid_company_prefix" } };
