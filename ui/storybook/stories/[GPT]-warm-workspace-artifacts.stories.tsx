import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CompanyArtifact, CompanyArtifactGroup, CompanyArtifactsResponse } from "@paperclipai/shared";
import { useQueryClient } from "@tanstack/react-query";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";
import { Artifacts } from "@/pages/Artifacts";
import { storybookIssueDocuments, storybookIssues } from "../fixtures/paperclipData";
import attachment from "../fixtures/warm-workspace-attachment.json";

const issue = storybookIssues[0]!;
const documents: CompanyArtifact[] = storybookIssueDocuments.map((document) => ({
  id: document.id, source: "document", mediaKind: "document", title: document.title ?? document.key,
  previewText: document.body, contentType: "text/markdown", contentPath: null, openPath: null, downloadPath: null,
  issue: { id: issue.id, identifier: issue.identifier!, title: issue.title }, project: null, createdByAgent: null,
  updatedAt: new Date(document.updatedAt).toISOString(), href: `/PAP/issues/${issue.identifier}#document-${document.key}`,
}));
const contentPath = `/api/attachments/${attachment.id}/content`;
const samples: CompanyArtifact[] = [...documents, {
  id: attachment.id, source: "attachment", mediaKind: "text", title: attachment.filename,
  previewText: attachment.body, contentType: attachment.contentType, contentPath, openPath: contentPath, downloadPath: `${contentPath}?download=1`,
  issue: { id: issue.id, identifier: issue.identifier!, title: issue.title }, project: null, createdByAgent: null,
  updatedAt: "2026-09-14T00:00:00Z", href: `/PAP/issues/${issue.identifier}#attachment-${attachment.id}`,
}];

function ArtifactsScenario({ state = "populated", streamlined = true }: {
  state?: "populated" | "empty" | "loading" | "error";
  streamlined?: boolean;
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
      if (url.pathname === "/api/companies/company-storybook/artifacts") {
        if (state === "loading") return new Promise<Response>(() => {});
        if (state === "error") return Response.json({ error: "Sample artifacts could not be loaded." }, { status: 503 });
        let artifacts = state === "empty" ? [] : samples;
        const q = url.searchParams.get("q")?.toLowerCase();
        const kind = url.searchParams.get("kind");
        if (q) artifacts = artifacts.filter((item) => `${item.title} ${item.previewText}`.toLowerCase().includes(q));
        if (kind) artifacts = artifacts.filter((item) => item.mediaKind === kind);
        const groupBy = url.searchParams.get("groupBy");
        const selected = url.searchParams.get("groupIssueId");
        const group: CompanyArtifactGroup = {
          id: issue.id, groupBy: groupBy === "parent_task" ? "parent_task" : "task", issue: samples[0]!.issue,
          title: issue.title, count: artifacts.length, mediaKinds: [...new Set(artifacts.map((item) => item.mediaKind))],
          previewArtifacts: artifacts, updatedAt: "2026-09-14T00:00:00Z", href: `/PAP/artifacts?groupBy=task&groupIssueId=${issue.id}`,
        };
        const result: CompanyArtifactsResponse = {
          artifacts: groupBy && !selected ? [] : artifacts,
          groups: groupBy && !selected && artifacts.length ? [group] : [],
          selectedGroup: selected === issue.id ? group : null, nextCursor: null,
        };
        return Response.json(result);
      }
      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      client.removeQueries({ queryKey: ["artifacts"] });
      if (previous === undefined) client.removeQueries({ queryKey: key, exact: true });
      else client.setQueryData(key, previous);
    };
  }, [client, state, streamlined]);
  useEffect(() => {
    if (location.pathname === initialPath) navigate("/PAP/artifacts", { replace: true });
  }, [initialPath, location.pathname, navigate]);
  if (!ready) return null;
  return <PluginLauncherProvider><Routes>
    <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
      <Route path="artifacts" element={<Artifacts />} />
      <Route path="*" element={<p>Preview navigation: {location.pathname}</p>} />
    </Route>
  </Routes></PluginLauncherProvider>;
}
const meta = { title: "Pages/Warm Workspace/Artifacts", component: ArtifactsScenario, parameters: { layout: "fullscreen" } } satisfies Meta<typeof ArtifactsScenario>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { args: {} };
export const Production: Story = { args: { streamlined: false } };
export const Empty: Story = { args: { state: "empty" } };
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
