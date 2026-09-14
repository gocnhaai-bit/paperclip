import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Services disconnect Cancel ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--app-services&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("Document service", { exact: true })).toBeVisible();
      const opener = main.getByRole("button", { name: /Disconnect/ });
      await opener.click();
      const dialog = page.getByRole("alertdialog");
      await expect(dialog.getByRole("heading", { name: "Disconnect Document service?" })).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Gateway new dialog Cancel ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--gateways-empty&viewMode=story&globals=theme:${theme}`);
      const opener = page.locator("main").getByRole("button", { name: "New gateway", exact: true });
      await opener.click();
      const dialog = page.getByRole("dialog", { name: "New gateway", exact: true });
      await expect(dialog.getByRole("button", { name: "Create gateway", exact: true })).toBeDisabled();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Profile wizard Cancel ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--profile-new&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { name: "New access profile", exact: true })).toBeVisible();
      await main.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(main.getByRole("heading", { name: "New access profile", exact: true })).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const story of ["skill-studio-saved", "skill-studio-saved-production"]) {
  for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
    for (const theme of ["light", "dark"]) {
      test(`saved Studio draft and file navigation ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--${story}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        await expect(main.getByRole("button", { name: "Version history", exact: true })).toBeVisible();
        await expect(main.getByText("Inspect the changed behavior before release.", { exact: true })).toBeVisible();
        const hasTabs = await main.getByRole("tab", { name: "Skill", exact: true }).count() > 0;
        await main.getByText("references", { exact: true }).click();
        await main.getByText("checklist.txt", { exact: true }).click();
        const editor = main.locator('textarea[spellcheck="false"]');
        await expect(editor).toHaveValue("Verify keyboard focus and draft retention.\n");
        await editor.fill("Unsaved local review draft");
        await expect(main.getByText("Unsaved edits", { exact: true })).toBeVisible();
        if (hasTabs) {
          await main.getByRole("tab", { name: "Input", exact: true }).click();
          await expect(editor).toBeHidden();
          await main.getByRole("tab", { name: "Skill", exact: true }).click();
          await expect(editor).toHaveValue("Unsaved local review draft");
        }
        page.once("dialog", (dialog) => dialog.dismiss());
        await main.getByText("SKILL.md", { exact: true }).click();
        await expect(editor).toHaveValue("Unsaved local review draft");
        page.once("dialog", (dialog) => dialog.accept());
        await main.getByText("SKILL.md", { exact: true }).click();
        await expect(main.getByText("Inspect the changed behavior before release.", { exact: true })).toBeVisible();
        await expect(main.getByText("Unsaved edits", { exact: true })).toHaveCount(0);
        if (hasTabs) await main.getByRole("tab", { name: "Input", exact: true }).click();
        await main.getByRole("treeitem", { name: /review.md/ }).getByText("review.md", { exact: true }).click();
        const input = main.getByRole("textbox", { name: "Skill test input", exact: true });
        await expect(input).toHaveValue("Review the mobile editor without running a skill.");
        await input.fill("Local input draft");
        if (hasTabs) {
          await main.getByRole("tab", { name: "Skill", exact: true }).click();
          await expect(input).toBeHidden();
          await main.getByRole("tab", { name: "Input", exact: true }).click();
          await expect(input).toHaveValue("Local input draft");
        }
        await main.getByRole("button", { name: "Revert", exact: true }).click();
        await expect(input).toHaveValue("Review the mobile editor without running a skill.");
        const versions = main.getByRole("button", { name: "Version history", exact: true });
        await versions.focus();
        await page.keyboard.press("Enter");
        const history = page.getByRole("dialog", { name: "Version history", exact: true });
        await expect(history.getByText("Keyboard review", { exact: true })).toBeVisible();
        await history.getByText("Initial review", { exact: true }).click();
        await history.getByText("Keyboard review", { exact: true }).click();
        await expect(history.getByText("Diff v1 → v2", { exact: true })).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(history).toBeHidden();
        await expect(versions).toBeFocused();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        await page.screenshot({ path: `/tmp/warm-studio-${story}-${theme}-${width}.png`, fullPage: true });
      });
    }
  }
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`read-only Studio fork inspection ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-read-only&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("This sample is an external read-only skill.", { exact: false })).toBeVisible();
      await expect(main.getByRole("button", { name: "Add file", exact: true })).toBeDisabled();
      const copy = main.getByRole("button", { name: "Edit a copy", exact: true });
      await copy.focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: "Edit a copy of Workspace review", exact: true });
      await expect(dialog.getByText("Nothing is assigned to it", { exact: false })).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(copy).toBeFocused();
    });
  }
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`connection detail read error ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--app-detail-load-error&viewMode=story&globals=theme:${theme}`);
      await expect(page.getByRole("alert")).toContainText("Sample connection could not be loaded.");
      await expect(page.getByText("We couldn't find that app.", { exact: true })).toHaveCount(0);
      await page.getByRole("button", { name: "Back to connectors", exact: true }).click();
      await expect(page.getByRole("searchbox", { name: "Search connectors" })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const theme of ["light", "dark"]) {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    for (const state of ["empty", "error"]) {
      test(`Apps review ${state} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--apps-review-${state}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        await expect(main.getByRole("heading", { name: "Review", exact: true })).toBeVisible();
        if (state === "error") {
          await expect(main.getByRole("alert")).toContainText("Could not load connection reviews.");
          await expect(main.getByText("Nothing is waiting for your OK right now.")).toHaveCount(0);
        } else await expect(main.getByText("Nothing is waiting for your OK right now.")).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Apps connect search without authorization ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--apps-connect-form&viewMode=story&globals=theme:${theme}`);
      const search = page.getByPlaceholder("Search apps…", { exact: true });
      await expect(search).toBeVisible();
      await search.fill("no-such-app");
      await expect(page.getByText("No apps match “no-such-app”.", { exact: true })).toBeVisible();
      await search.fill("Notion");
      await expect(page.locator("main").getByRole("button", { name: /Notion/ }).first()).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`connection permissions read-only ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--app-detail-read-only&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { name: "Workspace documents", exact: true })).toBeVisible();
      await expect(main.getByText("No agents can use this connection.", { exact: true })).toBeVisible();
      await expect(main.getByRole("button", { name: "Choose agents", exact: true })).toHaveCount(0);
      await expect(main.getByRole("radiogroup", { name: "Which agents can use this connection" })).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Studio histories fail without empty claims ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-history-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("Inspect the changed behavior before release.", { exact: true })).toBeVisible();
      if (await main.getByRole("tab", { name: "Input", exact: true }).count()) await main.getByRole("tab", { name: "Input", exact: true }).click();
      await expect(main.getByRole("alert").filter({ hasText: "Sample saved inputs unavailable." })).toBeVisible();
      if (await main.getByRole("tab", { name: "Runs", exact: true }).count()) await main.getByRole("tab", { name: "Runs", exact: true }).click();
      await expect(main.getByRole("alert").filter({ hasText: "Sample run history unavailable." })).toBeVisible();
      await expect(main.getByText("No test runs yet. Pick an agent and Run.")).toHaveCount(0);
      const versions = main.getByRole("button", { name: "Version history", exact: true });
      await versions.click();
      const history = page.getByRole("dialog", { name: "Version history", exact: true });
      await expect(history.getByRole("alert")).toContainText("Sample version history unavailable.");
      await expect(history.getByText("No versions yet. Save changes to create the first.")).toHaveCount(0);
      await page.keyboard.press("Escape");
      await expect(history).toBeHidden();
      await expect(versions).toBeFocused();
    });
  }
}

test("Studio keeps file and input drafts across responsive layouts", async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.goto("/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-saved&viewMode=story");
  const main = page.locator("main");
  await expect(main.getByText("Inspect the changed behavior before release.", { exact: true })).toBeVisible();
  await main.getByText("references", { exact: true }).click();
  await main.getByText("checklist.txt", { exact: true }).click();
  await main.locator('textarea[spellcheck="false"]').fill("File draft across resize");
  await main.getByRole("treeitem", { name: /review.md/ }).getByText("review.md", { exact: true }).click();
  await main.getByRole("textbox", { name: "Skill test input", exact: true }).fill("Input draft across resize");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(main.locator('textarea[spellcheck="false"]')).toHaveValue("File draft across resize");
  await main.getByRole("tab", { name: "Input", exact: true }).click();
  await expect(main.getByRole("textbox", { name: "Skill test input", exact: true })).toHaveValue("Input draft across resize");
  await page.setViewportSize({ width: 1800, height: 1000 });
  await expect(main.locator('textarea[spellcheck="false"]')).toHaveValue("File draft across resize");
  await expect(main.getByRole("textbox", { name: "Skill test input", exact: true })).toHaveValue("Input draft across resize");
});

test("Skill Studio read failure is not a missing skill", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-load-error&viewMode=story");
  await expect(page.getByText("Sample skill could not be loaded.")).toBeVisible();
  await expect(page.getByText("Skill not found.", { exact: true })).toHaveCount(0);
});

for (const story of ["skill-studio-new", "skill-studio-new-production"]) {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    test(`host Skill Studio create form can be cancelled ${story} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--${story}&viewMode=story`);
      await expect(page.getByPlaceholder("Code review", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Create skill", exact: true })).toBeDisabled();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(page.getByRole("button", { name: "New skill", exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}


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
