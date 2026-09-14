import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const family of ["artifacts", "routines", "routines-production"]) {
      test(`${family} populated full shell ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        const story = family === "routines-production" ? "routines--populated-classic" : `${family}--populated`;
        await page.goto(`/iframe.html?id=pages-warm-workspace-${story}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        if (family === "artifacts") {
          const search = page.getByRole("textbox", { name: "Search artifacts", exact: true });
          await expect(search).toBeVisible();
          await page.getByTestId("artifact-group-control").click();
          await page.getByTestId("artifact-group-option-none").click();
          await search.fill("no-such-artifact");
          await expect(main.getByText("No artifacts match this search.")).toBeVisible();
          await search.fill("workspace-layout-review-notes");
          await expect(main.getByText("workspace-layout-review-notes.txt", { exact: true }).first()).toBeVisible();
        } else await expect(main.getByText("Weekly digest", { exact: true })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}
