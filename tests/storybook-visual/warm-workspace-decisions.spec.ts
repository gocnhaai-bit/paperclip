import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const story of ["full-shell-desk", "full-shell-production-desk", "full-shell-queue"]) {
      test(`Decisions full shell ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-decisions-desk--${story}&viewMode=story&globals=theme:${theme}`);
        await expect(page.locator("main").getByRole("heading", { name: story.endsWith("queue") ? "PRs to review" : "Decisions", exact: true })).toBeVisible();
        await expect(page.getByText("Merge PR #10664: decisions desk data layer", { exact: true }).first()).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        const group = page.getByRole("button", { name: /Group/ }).first();
        await group.click();
        await expect(page.locator('[data-slot="popover-content"]')).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.locator('[data-slot="popover-content"]')).toBeHidden();
        await expect(group).toBeFocused();
        if (width === 390 && theme === "light") await page.screenshot({ path: `/tmp/warm-decisions-${story}.png` });
      });
    }
  }
}
for (const state of ["empty", "loading", "error"]) {
  test(`Decisions ${state}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=pages-decisions-desk--full-shell-${state}&viewMode=story&globals=theme:dark`);
    if (state === "empty") await expect(page.getByText("You're all caught up", { exact: true })).toBeVisible();
    else if (state === "error") await expect(page.getByText("Sample decisions could not be loaded.", { exact: true })).toBeVisible();
    else await expect(page.locator('main [data-slot="skeleton"]').first()).toBeVisible();
  });
}
