import { expect, test } from "@playwright/test";

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
