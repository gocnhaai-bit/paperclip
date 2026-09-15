import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Routine production populated trigger ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-routines--triggers-populated-production&viewMode=story&globals=theme:${theme}`);
      await expect(page.locator("main").getByText("Weekly schedule", { exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
    test(`Routine production populated run ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-routines--runs-populated-production&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("Preview dispatch unavailable", { exact: false })).toBeVisible();
      const status = main.getByRole("combobox", { name: "Filter by status" });
      await status.click();
      await page.getByRole("option", { name: "failed", exact: true }).click();
      await expect(main.getByText("Preview dispatch unavailable", { exact: false })).toBeVisible();
      await status.click();
      await page.keyboard.press("Escape");
      await expect(status).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Routine multi-status filters ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-routines--runs-populated-production&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("Preview dispatch unavailable", { exact: false })).toBeVisible();
      await expect(main.getByText("manual", { exact: true }).first()).toBeVisible();
      const status = main.getByRole("combobox", { name: "Filter by status" });
      await status.click();
      await page.getByRole("option", { name: "succeeded", exact: true }).click();
      await expect(main.getByText("manual", { exact: true }).first()).toBeVisible();
      await expect(main.getByText("Preview dispatch unavailable", { exact: false })).toHaveCount(0);
      await main.getByRole("button", { name: "Clear all", exact: true }).click();
      await expect(main.getByText("Preview dispatch unavailable", { exact: false })).toBeVisible();
      const source = main.getByRole("combobox", { name: "Filter by source" });
      await source.click();
      await page.getByRole("option", { name: "schedule", exact: true }).click();
      await expect(main.getByText("manual", { exact: true })).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Routine cron validation ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-routines--triggers-populated-production&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await main.getByRole("button", { name: "New trigger", exact: true }).click();
      const addForm = main.getByText("Add trigger", { exact: true }).first().locator("..");
      await addForm.getByRole("combobox", { name: "Schedule frequency" }).click();
      await page.getByRole("option", { name: "Custom (cron)", exact: true }).click();
      const cron = main.getByRole("textbox", { name: "Cron expression", exact: true });
      await cron.fill("bad cron");
      await expect(cron).toHaveAttribute("aria-invalid", "true");
      await expect(main.getByText("Use exactly 5 fields; this has 2.", { exact: true })).toBeVisible();
      await expect(main.getByRole("button", { name: "Add trigger", exact: true })).toBeDisabled();
      await cron.fill("0 10 * * *");
      await expect(cron).toHaveAttribute("aria-invalid", "false");
      await expect(main.getByText(/^Valid cron\./)).toBeVisible();
      await expect(main.getByRole("button", { name: "Add trigger", exact: true })).toBeEnabled();
      await main.getByRole("button", { name: "Cancel", exact: true }).last().click();
      await expect(cron).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Routine date window filters old runs ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-routines--runs-populated-production&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("api", { exact: true })).toBeVisible();
      const date = main.getByRole("combobox", { name: "Filter by date" });
      await date.click();
      await page.getByRole("option", { name: "Last 30d", exact: true }).click();
      await expect(main.getByText("api", { exact: true })).toHaveCount(0);
      await expect(main.getByText("manual", { exact: true }).first()).toBeVisible();
      await main.getByRole("button", { name: "Clear all", exact: true }).click();
      await expect(main.getByText("api", { exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Routine trigger mutation failures remain visible ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-routines--triggers-populated-production&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      const trigger = main.getByRole("form", { name: "Trigger: Weekly schedule", exact: true });
      const label = trigger.locator("input").first();
      await label.fill("Unsaved weekly draft");
      await trigger.getByRole("button", { name: "Save trigger", exact: true }).click();
      await expect(page.getByText("Failed to update trigger", { exact: true })).toBeVisible();
      await expect(label).toHaveValue("Unsaved weekly draft");
      await trigger.getByRole("button", { name: "Delete", exact: true }).click();
      await expect(page.getByText("Failed to delete trigger", { exact: true })).toBeVisible();
      await expect(trigger).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Routine revision restore failure stays actionable ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-routines--history-populated&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await main.getByTestId("revision-row-1").click();
      const restore = main.getByRole("button", { name: "Restore this revision", exact: true }).first();
      await restore.click();
      const dialog = page.getByRole("dialog", { name: "Restore revision 1?", exact: true });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Restore as revision 3", exact: true }).click();
      await expect(page.getByText("Failed to restore revision", { exact: true })).toBeVisible();
      await expect(dialog).toBeVisible();
      await expect(main.getByTestId("revision-row-1")).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [story, content] of [
  ["activity-populated", "routine.updated"],
  ["history-populated", "Version history"],
  ["delivery-populated", "Next 5 fires"],
  ["audit-activity-populated", "routine.updated"],
  ["audit-runs-populated", "Routine runs"],
] as const) {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    for (const theme of ["light", "dark"]) {
      test(`Routine operational surface ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-routines--${story}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        await expect(main.getByText(content, { exact: true }).first()).toBeVisible();
        if (story === "history-populated") {
          await main.getByTestId("revision-row-1").click();
          await expect(main.getByText("Viewing revision 1 (read-only)", { exact: true })).toBeVisible();
          await main.getByRole("button", { name: "Compare with current", exact: true }).click();
          const dialog = page.getByRole("dialog", { name: "Compare routine revisions", exact: true });
          await expect(dialog.getByText("Description diff", { exact: true })).toBeVisible();
          await dialog.getByRole("button", { name: "Close", exact: true }).first().click();
          await expect(dialog).toBeHidden();
        }
        if (story === "audit-runs-populated") {
          await expect(main.getByText("Routine run", { exact: true }).first()).toBeVisible();
          await expect(main.getByText("manual", { exact: true }).first()).toBeVisible();
          await expect(main.getByText("succeeded", { exact: true }).first()).toBeVisible();
        }
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

test("artifact load failure is not an empty library", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-artifacts--error&viewMode=story");
  await expect(page.getByText("Sample artifacts could not be loaded.")).toBeVisible();
  await expect(page.getByText("No artifact stacks yet.", { exact: true })).toHaveCount(0);
});

for (const state of ["loading", "error"]) {
  test(`routine detail ${state} is visible`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=pages-warm-workspace-routines--detail-${state}&viewMode=story&globals=theme:dark`);
    if (state === "error") await expect(page.getByText("Sample routine could not be loaded.")).toBeVisible();
    else await expect(page.locator('main [data-slot="skeleton"]').first()).toBeVisible();
  });
}

for (const story of ["detail", "detail-production"]) {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    test(`routine detail actual owner ${story} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-routines--${story}&viewMode=story`);
      await expect(page.locator("main").getByText("Weekly digest", { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/Preview navigation:/)).toHaveCount(0);
      if (story === "detail") {
        await page.getByRole("button", { name: "History", exact: true }).click();
        await expect(page.getByRole("button", { name: "Back to overview", exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Back to overview", exact: true }).click();
        await page.getByRole("button", { name: "Edit routine", exact: true }).click();
        await expect(page.getByPlaceholder("Routine title", { exact: true })).toHaveValue("Weekly digest");
        await page.getByRole("button", { name: "Cancel editing", exact: true }).click();
        await expect(page.getByRole("button", { name: "Edit routine", exact: true })).toBeVisible();
        const runButton = page.getByRole("button", { name: "Run now", exact: true });
        await runButton.click();
        const dialog = page.getByRole("dialog");
        await expect(dialog.getByRole("heading", { name: "Run routine", exact: true })).toBeVisible();
        await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect(runButton).toBeFocused();
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`artifact stack opens and returns with its search preserved at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/iframe.html?id=pages-warm-workspace-artifacts--populated&viewMode=story");
    const search = page.getByRole("textbox", { name: "Search artifacts", exact: true });
    await search.fill("workspace-layout-review-notes");
    const stack = page.getByTestId("artifact-group-card");
    await expect(stack).toHaveCount(1);
    await stack.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("artifact-stack-back")).toBeVisible();
    await expect(page.locator("main").getByText("workspace-layout-review-notes.txt", { exact: true }).first()).toBeVisible();
    await page.getByTestId("artifact-stack-back").click();
    await expect(stack).toBeVisible();
    await expect(search).toHaveValue("workspace-layout-review-notes");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

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
