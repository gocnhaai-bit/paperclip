import { expect, test } from "@playwright/test";

for (const [story, heading] of [
  ["board-claim", "Claim Board ownership"],
  ["board-claim-sign-in", "Sign in required"],
  ["cli-auth", "Approve Paperclip CLI access"],
  ["cli-auth-sign-in", "Sign in required"],
  ["invite", "Join Paperclip Storybook"],
  ["invite-error", "Invite not available"],
  ["o-auth-handoff-expired", "Sign-in couldn’t continue"],
  ["chat-identity", "Link your external identity"],
  ["chat-identity-invalid", "This identity link is unavailable"],
] as const) {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    for (const theme of ["light", "dark"]) {
      test(`auth callback ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-auth--${story}&viewMode=story&globals=theme:${theme}`);
        const surface = page;
        await expect(surface.getByRole("heading", { name: heading, exact: true })).toBeVisible();
        if (story === "board-claim") {
          await expect(surface.getByRole("button", { name: "Claim ownership", exact: true })).toBeEnabled();
        }
        if (story === "board-claim-sign-in") {
          await expect(surface.getByRole("link", { name: "Sign in / Create account", exact: true })).toHaveAttribute("href", /next=/);
        }
        if (story === "cli-auth") {
          await expect(surface.getByText("paperclipai auth login", { exact: true })).toBeVisible();
          await expect(surface.getByRole("button", { name: "Approve CLI access", exact: true })).toBeEnabled();
          await expect(surface.getByRole("button", { name: "Cancel", exact: true })).toBeEnabled();
        }
        if (story === "invite") {
          await expect(surface.getByText("Review the workspace before joining.", { exact: true })).toBeVisible();
          await expect(surface.getByRole("button", { name: "Create account and continue", exact: true })).toHaveAttribute("aria-disabled", "true");
          await surface.getByRole("button", { name: "I already have an account", exact: true }).click();
          await expect(surface.getByRole("heading", { name: "Sign in to continue", exact: true })).toBeVisible();
        }
        if (story === "o-auth-handoff-expired") {
          await expect(surface.getByText("This sign-in expired.", { exact: false })).toBeVisible();
          await expect(surface.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
        }
        if (story === "chat-identity") {
          await expect(surface.getByText("Slack", { exact: true })).toBeVisible();
          await expect(surface.getByText("@board", { exact: false })).toBeVisible();
          await expect(surface.getByRole("button", { name: "Confirm identity", exact: true })).toBeEnabled();
        }
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`auth form toggles and validates locally ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-auth--sign-in-form&viewMode=story&globals=theme:${theme}`);
      await expect(page.getByRole("heading", { name: "Sign in to Paperclip" })).toBeVisible();
      await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Create one", exact: true }).click();
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Create Account", exact: true })).toHaveAttribute("aria-disabled", "true");
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Sign in to Paperclip" })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
    for (const story of ["not-found-board", "not-found-board-production", "not-found-global", "not-found-invalid-prefix"]) {
      test(`error route ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-auth--${story}&viewMode=story&globals=theme:${theme}`);
        await expect(page.getByRole("heading", { name: story.endsWith("invalid-prefix") ? "Organization not found" : "Page not found", exact: true })).toBeVisible();
        await expect(page.getByRole("link", { name: "Open dashboard", exact: true })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}
