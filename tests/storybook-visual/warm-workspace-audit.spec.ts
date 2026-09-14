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
for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`Audit tabs navigate between actual pages at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/iframe.html?id=pages-warm-workspace-audit-costs--activity-streamlined-populated&viewMode=story");
    const main = page.locator("main");
    await main.getByRole("tab", { name: "Costs", exact: true }).click();
    await expect(main.getByText("$675.00", { exact: false }).first()).toBeVisible();
    await main.getByRole("tab", { name: "Budgets", exact: true }).click();
    await expect(main.getByText("Paperclip Storybook", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Preview navigation:/)).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Runs filters change visible results ${width} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-audit-costs--runs-populated&viewMode=story&globals=theme:${theme}`);
      const runs = page.getByRole("list", { name: "Recent runs", exact: true });
      await expect(runs.getByRole("listitem")).toHaveCount(2);
      await page.getByRole("combobox", { name: "Status", exact: true }).click();
      await page.getByRole("option", { name: "failed", exact: true }).click();
      await expect(runs.getByRole("listitem")).toHaveCount(1);
      await expect(runs).toContainText("Sample verification failed");
      await page.getByRole("button", { name: "Clear filters", exact: true }).click();
      await expect(runs.getByRole("listitem")).toHaveCount(2);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`Timeline route retains range and zoom controls ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/iframe.html?id=pages-warm-workspace-audit-costs--timeline-populated&viewMode=story");
    await expect(page.getByLabel("Timeline start date", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.getByRole("button", { name: "Reset zoom", exact: true }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

for (const state of ["empty", "loading", "error"]) {
  test(`Runs dedicated state ${state}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=pages-warm-workspace-audit-costs--runs-${state}&viewMode=story`);
    const main = page.locator("main");
    await expect(main.getByText(state === "error" ? "Sample runs could not be loaded." : state === "loading" ? "Loading runs…" : "No runs yet.", { exact: true })).toBeVisible();
  });
}

for (const state of ["empty", "loading", "error"]) {
  test(`Budgets dedicated state ${state}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=pages-warm-workspace-audit-costs--budgets-${state}&viewMode=story&globals=theme:dark`);
    const main = page.locator("main");
    if (state === "error") await expect(main.getByText("Sample budgets could not be loaded.")).toBeVisible();
    else if (state === "loading") await expect(main.locator('[data-slot="skeleton"]').first()).toBeVisible();
    else await expect(main.getByText(/No budget policies yet/)).toBeVisible();
  });
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
