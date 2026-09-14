import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const story of ["streamlined-mine", "streamlined-recent", "streamlined-unread", "streamlined-blocked", "streamlined-all", "legacy-mine", "legacy-blocked", "legacy-all"]) {
      test(`Inbox real route ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-inbox--${story}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        await expect(main.getByRole("link", { name: /PAP-/ }).first()).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

test("Inbox blocked errors are visible", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-inbox--blocked-error&viewMode=story");
  await expect(page.getByTestId("blocked-inbox-error")).toBeVisible();
});
