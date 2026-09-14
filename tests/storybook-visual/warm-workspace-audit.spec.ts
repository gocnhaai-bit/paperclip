import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const scope of ["activity", "costs"]) {
      for (const layout of ["streamlined", "production"]) {
        test(`Audit Costs ${scope} ${layout} ${theme} ${width}`, async ({ page }) => {
          await page.setViewportSize({ width, height });
          await page.goto(`/iframe.html?id=pages-warm-workspace-audit-costs--${scope}-${layout}-populated&viewMode=story&globals=theme:${theme}`);
          const main = page.locator("main");
          if (scope === "activity") await expect(main.getByText("PAP-1641", { exact: false }).first()).toBeVisible();
          else await expect(main.getByText("$675.00", { exact: false }).first()).toBeVisible();
          await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        });
      }
    }
  }
}
for (const scope of ["activity", "costs"]) {
  for (const state of ["empty", "loading", "error"]) {
    test(`Audit Costs state ${scope} ${state}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/iframe.html?id=pages-warm-workspace-audit-costs--${scope}-streamlined-${state}&viewMode=story&globals=theme:dark`);
      const main = page.locator("main");
      if (state === "error") await expect(main.getByText(scope === "activity" ? "Sample audit feed could not be loaded." : "Sample costs could not be loaded.", { exact: false }).first()).toBeVisible();
      else if (state === "empty") await expect(main.getByText(scope === "activity" ? "Nothing here yet" : "No cost events yet.", { exact: true })).toBeVisible();
      else if (scope === "activity") await expect(main.getByText("Loading…", { exact: true })).toBeVisible();
      else await expect(main.locator('[data-slot="skeleton"]').first()).toBeVisible();
    });
  }
}
