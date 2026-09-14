import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const story of ["apps", "skills", "skills-production"]) {
      test(`Catalog entry ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--${story}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        if (story === "apps") {
          await expect(page.getByRole("searchbox", { name: "Search connectors" })).toBeVisible();
          await page.getByRole("searchbox", { name: "Search connectors" }).fill("no-such-connector");
          await expect(main.getByText(/No connectors match/)).toBeVisible();
        } else await expect(main.getByText("Browser testing", { exact: true }).first()).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}
