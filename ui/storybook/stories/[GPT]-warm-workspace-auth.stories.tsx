import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";
import { Routes, Route, useLocation, useNavigate } from "@/lib/router";
import type { AuthSession } from "@paperclipai/shared";
import { AuthPage } from "@/pages/Auth";
import { BoardClaimPage } from "@/pages/BoardClaim";
import { CliAuthPage } from "@/pages/CliAuth";
import { InviteLandingPage } from "@/pages/InviteLanding";
import { NotFoundPage } from "@/pages/NotFound";
import { PaperclipCloudOAuthHandoffPage } from "@/pages/apps/PaperclipCloudOAuthHandoff";
import { ChatIdentityConfirm } from "@/pages/apps/chat/ChatIdentityConfirm";
import { Layout } from "@/components/Layout";
import { Layout as ProductionLayout } from "@/components/Layout.production";
import { PluginLauncherProvider } from "@/plugins/launchers";
import { queryKeys } from "@/lib/queryKeys";

const PREVIEW_TOKEN = "preview-token-with-thirty-two-chars";
const PREVIEW_SESSION: AuthSession = {
  user: { id: "user-board", name: "Board Operator", email: "board@paperclip.local", image: null },
  session: { id: "session-preview", userId: "user-board" },
  sentryDsn: null,
};

type AuthPreviewPage =
  | "auth"
  | "board"
  | "global"
  | "invalid_company_prefix"
  | "board-claim"
  | "board-claim-sign-in"
  | "cli-auth"
  | "cli-auth-sign-in"
  | "invite"
  | "invite-error"
  | "oauth-handoff"
  | "chat-identity"
  | "chat-identity-invalid";

function AuthScenario({ page = "auth", streamlined = true }: {
  page?: AuthPreviewPage;
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
    client.setQueryData(settingsKey, { enableStreamlinedUi: streamlined, enableChatConnectors: true });
    if (page === "auth" || page.endsWith("sign-in") || page.startsWith("invite")) {
      client.setQueryData(queryKeys.auth.session, null);
    } else {
      client.setQueryData(queryKeys.auth.session, PREVIEW_SESSION);
    }
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (url.pathname.startsWith("/api/") && method !== "GET") return Response.json({ error: "This preview is read-only." }, { status: 403 });
      if (url.pathname === "/api/auth/get-session") {
        if (page === "auth" || page.endsWith("sign-in") || page.startsWith("invite")) return Response.json(null);
        return Response.json(PREVIEW_SESSION);
      }
      if (url.pathname === "/api/health") return Response.json({ status: "ok", deploymentMode: "authenticated", deploymentExposure: "private" });
      if (url.pathname === "/api/instance/settings/general") return Response.json({ keyboardShortcuts: true });
      if (url.pathname === "/api/instance/settings/experimental") return Response.json({ enableStreamlinedUi: streamlined, enableChatConnectors: true });
      if (url.pathname === `/api/board-claim/${PREVIEW_TOKEN}`) return Response.json({ status: "available", requiresSignIn: page === "board-claim-sign-in", expiresAt: "2099-01-01T00:00:00Z", claimedByUserId: null });
      if (url.pathname === "/api/cli-auth/challenges/preview-challenge") return Response.json({
        id: "preview-challenge", status: "pending", command: "paperclipai auth login", clientName: "Paperclip CLI",
        requestedAccess: "board", requestedCompanyId: "company-storybook", requestedCompanyName: "Paperclip Storybook",
        approvedAt: null, cancelledAt: null, expiresAt: "2099-01-01T00:00:00Z", approvedByUser: null,
        requiresSignIn: page === "cli-auth-sign-in", canApprove: page !== "cli-auth-sign-in", currentUserId: page === "cli-auth-sign-in" ? null : "user-board",
      });
      if (url.pathname === `/api/invites/${PREVIEW_TOKEN}`) {
        if (page === "invite-error") return Response.json({ error: "Invite expired." }, { status: 410 });
        return Response.json({ id: "invite-preview", companyId: "company-storybook", companyName: "Paperclip Storybook", companyLogoUrl: null,
          inviteType: "company_join", allowedJoinTypes: "human", humanRole: "operator", expiresAt: "2099-01-01T00:00:00Z",
          inviteMessage: "Review the workspace before joining.", invitedByUserName: "Board Operator", joinRequestStatus: null, joinRequestType: null });
      }
      if (url.pathname === "/api/chat-identity-links/preview") {
        if (page === "chat-identity-invalid") return Response.json({ error: "Identity link expired." }, { status: 410 });
        return Response.json({ endpointId: "chat-endpoint", companyId: "company-storybook", companyName: "Paperclip Storybook", companyPrefix: "PAP",
          provider: "slack", providerAccountLabel: "Preview workspace", botLabel: "Sage", externalLabel: "Board Operator", externalDetail: "@board", expiresAt: "2099-01-01T00:00:00Z" });
      }
      return originalFetch(input, init);
    };
    setReady(true);
    return () => {
      window.fetch = originalFetch;
      if (previousSettings === undefined) client.removeQueries({ queryKey: settingsKey, exact: true });
      else client.setQueryData(settingsKey, previousSettings);
      if (previousSession === undefined) client.removeQueries({ queryKey: queryKeys.auth.session, exact: true });
      else client.setQueryData(queryKeys.auth.session, previousSession);
      client.removeQueries({ predicate: ({ queryKey }) => queryKey.some((part) => [PREVIEW_TOKEN, "preview-challenge"].includes(String(part))) });
    };
  }, [client, page, streamlined]);

  useEffect(() => {
    const target: Record<AuthPreviewPage, string> = {
      auth: "/auth",
      board: "/PAP/missing-page",
      global: "/missing-page",
      invalid_company_prefix: "/missing-page",
      "board-claim": `/board-claim/${PREVIEW_TOKEN}?code=preview-code`,
      "board-claim-sign-in": `/board-claim/${PREVIEW_TOKEN}?code=preview-code`,
      "cli-auth": "/cli-auth/preview-challenge?token=preview-auth-token",
      "cli-auth-sign-in": "/cli-auth/preview-challenge?token=preview-auth-token",
      invite: `/invite/${PREVIEW_TOKEN}`,
      "invite-error": `/invite/${PREVIEW_TOKEN}`,
      "oauth-handoff": "/oauth-handoff",
      "chat-identity": `/chat-identity/confirm?token=${PREVIEW_TOKEN}`,
      "chat-identity-invalid": "/chat-identity/confirm?token=short",
    };
    if (location.pathname === initialPath) navigate(target[page], { replace: true });
  }, [initialPath, location.pathname, navigate, page]);

  if (!ready) return null;
  return <PluginLauncherProvider><Routes>
    <Route path="auth" element={<AuthPage />} />
    <Route path="board-claim/:token" element={<BoardClaimPage />} />
    <Route path="cli-auth/:id" element={<CliAuthPage />} />
    <Route path="invite/:token" element={<InviteLandingPage />} />
    <Route path="oauth-handoff" element={<PaperclipCloudOAuthHandoffPage />} />
    <Route path="chat-identity/confirm" element={<ChatIdentityConfirm />} />
    <Route path="/:companyPrefix" element={streamlined ? <Layout /> : <ProductionLayout />}>
      <Route path="missing-page" element={<NotFoundPage scope="board" />} />
    </Route>
    <Route path="*" element={page === "auth" ? <p>Preview navigation: {location.pathname}</p> : <NotFoundPage scope={page === "board" ? "board" : page === "invalid_company_prefix" ? "invalid_company_prefix" : "global"} requestedPrefix="missing" />} />
  </Routes></PluginLauncherProvider>;
}

const meta = { title: "Pages/Warm Workspace/Auth", component: AuthScenario, parameters: { layout: "fullscreen" } } satisfies Meta<typeof AuthScenario>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SignInForm: Story = { args: {} };
export const BoardClaim: Story = { args: { page: "board-claim" } };
export const BoardClaimSignIn: Story = { args: { page: "board-claim-sign-in" } };
export const CliAuth: Story = { args: { page: "cli-auth" } };
export const CliAuthSignIn: Story = { args: { page: "cli-auth-sign-in" } };
export const Invite: Story = { args: { page: "invite" } };
export const InviteError: Story = { args: { page: "invite-error" } };
export const OAuthHandoffExpired: Story = { args: { page: "oauth-handoff" } };
export const ChatIdentity: Story = { args: { page: "chat-identity" } };
export const ChatIdentityInvalid: Story = { args: { page: "chat-identity-invalid" } };
export const NotFoundBoard: Story = { args: { page: "board" } };
export const NotFoundBoardProduction: Story = { args: { page: "board", streamlined: false } };
export const NotFoundGlobal: Story = { args: { page: "global" } };
export const NotFoundInvalidPrefix: Story = { args: { page: "invalid_company_prefix" } };
