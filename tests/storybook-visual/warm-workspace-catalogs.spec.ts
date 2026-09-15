import { expect, test, type Locator } from "@playwright/test";

async function openStudioPane(main: Locator, name: "Input" | "Runs") {
  const tabList = main.getByRole("tablist");
  try {
    await tabList.waitFor({ state: "attached", timeout: 2000 });
  } catch {
    return;
  }
  await main.getByRole("tab", { name, exact: true }).click();
}

for (const [story, heading] of [
  ["gateway-overview-populated", "Who can use it"],
  ["gateway-tokens-populated", "Token history"],
  ["gateway-activity-populated", "Sage used Read document in Workspace documents"],
  ["gateway-advanced-populated", "Raw configuration"],
] as const) {
  for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
    for (const theme of ["light", "dark"]) {
      test(`populated gateway ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--${story}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        await expect(main.getByRole("heading", { name: "Workspace gateway", exact: true })).toBeVisible();
        if (story === "gateway-tokens-populated") {
          await expect(main.getByRole("button", { name: /Token history/ })).toBeVisible();
        } else {
          await expect(main.getByText(heading, { exact: true })).toBeVisible();
        }
        if (story === "gateway-tokens-populated") {
          await main.getByRole("button", { name: /Token history/ }).click();
          const tokenHistory = width >= 640 ? main.getByRole("table") : main.locator(".sm\\:hidden");
          await expect(tokenHistory.getByText("Workspace desktop", { exact: true })).toBeVisible();
          await expect(tokenHistory.getByText("pcgw•••", { exact: true })).toBeVisible();
          await expect(main.getByText(/pcgw_/)).toHaveCount(0);
        }
        if (story === "gateway-activity-populated") {
          await main.getByRole("button", { name: /Sage used Read document/ }).click();
          await expect(main.getByText("Arguments (redacted)", { exact: true })).toBeVisible();
          await expect(main.getByText("42 ms", { exact: true })).toBeVisible();
        }
        if (story === "gateway-advanced-populated") {
          const archive = main.getByRole("button", { name: "Archive gateway", exact: true });
          await archive.click();
          await expect(main.getByRole("textbox", { name: "Type the gateway name to confirm archive" })).toBeVisible();
          await main.getByRole("button", { name: "Cancel", exact: true }).click();
          await expect(main.getByRole("textbox", { name: "Type the gateway name to confirm archive" })).toHaveCount(0);
        }
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

for (const [story, title] of [
  ["profile-detail-populated", "Workspace operations"],
  ["profile-edit-populated", "Finish your profile"],
] as const) {
  for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
    for (const theme of ["light", "dark"]) {
      test(`populated access profile ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--${story}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        await expect(main.getByRole("heading", { name: title, exact: true })).toBeVisible();
        if (story === "profile-detail-populated") {
          await expect(main.getByText("List documents", { exact: true })).toBeVisible();
          await expect(main.getByText("Sage", { exact: true })).toBeVisible();
          await expect(main.getByText("Stay blocked until reviewed", { exact: true })).toBeVisible();
          await main.getByRole("button", { name: "Edit tools", exact: true }).click();
          await expect(main.getByRole("heading", { name: "Finish your profile", exact: true })).toBeVisible();
        } else {
          await expect(main.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Workspace operations");
          await expect(main.getByRole("button", { name: /Everyday work/ })).toBeVisible();
          await main.getByRole("button", { name: "Cancel", exact: true }).click();
          await expect(main.getByRole("heading", { name: "Finish your profile", exact: true })).toHaveCount(0);
        }
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Gateway Apps and tools links to the connection ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--gateway-apps-populated&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { name: "Workspace gateway", exact: true })).toBeVisible();
      await expect(main.getByText("Workspace documents", { exact: true })).toBeVisible();
      await expect(main.getByText("2 tools", { exact: true })).toBeVisible();
      const open = main.getByRole("link", { name: "Open →", exact: true });
      await expect(open).toHaveAttribute("href", "/PAP/apps/warm-connected/permissions");
      await open.click();
      await expect(main.getByRole("heading", { name: "Workspace documents", exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Gateway client snippets stay truthful without a token ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--gateway-overview-populated&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      const opener = main.getByRole("button", { name: "Client snippets", exact: true });
      await opener.click();
      const dialog = page.getByRole("dialog").filter({ hasText: "Client snippets" });
      await expect(dialog.getByText("Issue a token before copying a snippet", { exact: false })).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Issue a token", exact: true })).toBeEnabled();
      await expect(dialog.getByText(/Authorization: Bearer pcgw_/)).toBeVisible();
      await dialog.getByRole("button", { name: "Done", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Gateway edit can be cancelled without changing the draft ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--gateway-overview-populated&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      const opener = main.getByRole("button", { name: "Edit", exact: true });
      await opener.click();
      const dialog = page.getByRole("dialog", { name: "Edit gateway", exact: true });
      const name = dialog.getByRole("textbox", { name: "Name", exact: true });
      await name.fill("Unsaved gateway draft");
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(main.getByRole("heading", { name: "Workspace gateway", exact: true })).toBeVisible();
      await expect(main.getByText("Unsaved gateway draft", { exact: true })).toHaveCount(0);
      await expect(opener).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

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

for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Services keeps cached rows after a failed refresh ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--app-services-refresh-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("Document service", { exact: true })).toBeVisible();
      await expect(main.getByText("1 service is connected.", { exact: true })).toBeVisible();
      await main.getByRole("button", { name: "Refresh services", exact: true }).click();
      await expect(main.getByRole("alert")).toContainText("Sample services refresh failed.");
      await expect(main.getByText("Document service", { exact: true })).toBeVisible();
      await expect(main.getByRole("list").getByText("Connected", { exact: true })).toBeVisible();
      await main.getByRole("button", { name: "Try again", exact: true }).click();
      await expect(main.getByRole("alert")).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`connection detail keeps cached content after a failed refresh ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--app-detail-refresh-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { name: "Workspace documents", exact: true })).toBeVisible();
      await main.getByRole("button", { name: "Refresh connection", exact: true }).click();
      await expect(main.getByRole("alert")).toContainText("Sample connection refresh failed.");
      await expect(main.getByRole("heading", { name: "Workspace documents", exact: true })).toBeVisible();
      await main.getByRole("button", { name: "Retry connection", exact: true }).click();
      await expect(main.getByRole("alert")).toHaveCount(0);
      await expect(main.getByRole("heading", { name: "Workspace documents", exact: true })).toBeVisible();
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
    test(`Studio keeps the local file draft after a failed refresh ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-saved-refresh-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("Inspect the changed behavior before release.", { exact: true })).toBeVisible();
      const editor = main.locator('textarea[spellcheck="false"]');
      await main.getByText("references", { exact: true }).click();
      await main.getByText("checklist.txt", { exact: true }).click();
      await expect(editor).toHaveValue("Verify keyboard focus and draft retention.\n");
      await editor.fill("Draft must survive a failed refresh.");
      await main.getByRole("button", { name: "Refresh file", exact: true }).click();
      await expect(main.getByRole("alert")).toContainText("Sample file refresh failed.");
      await expect(editor).toHaveValue("Draft must survive a failed refresh.");
      await expect(main.getByText("Unsaved edits", { exact: true })).toBeVisible();
      await expect(main.getByRole("button", { name: "Save", exact: true })).toBeEnabled();
      await main.getByRole("button", { name: "Retry", exact: true }).click();
      await expect(main.getByRole("alert")).toHaveCount(0);
      await expect(editor).toHaveValue("Draft must survive a failed refresh.");
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
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

for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Studio keeps saved inputs after a failed refresh ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-input-refresh-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByText("Inspect the changed behavior before release.", { exact: true })).toBeVisible();
      await openStudioPane(main, "Input");
      const inputRow = main.getByRole("treeitem", { name: /review\.md/ });
      await inputRow.getByText("review.md", { exact: true }).click();
      const input = main.getByRole("textbox", { name: "Skill test input", exact: true });
      await expect(input).toHaveValue("Review the mobile editor without running a skill.");
      await main.getByRole("button", { name: "Refresh inputs", exact: true }).click();
      await expect(main.getByRole("alert")).toContainText("Sample saved inputs refresh failed.");
      await expect(inputRow).toBeVisible();
      await expect(input).toHaveValue("Review the mobile editor without running a skill.");
      await main.getByRole("button", { name: "Try again", exact: true }).click();
      await expect(main.getByRole("alert")).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Studio keeps run rows after a failed refresh ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-runs-refresh-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await openStudioPane(main, "Runs");
      await expect(main.getByText("#warmrun", { exact: true })).toBeVisible();
      await main.getByRole("button", { name: "Refresh runs", exact: true }).click();
      await expect(main.getByRole("alert")).toContainText("Sample run history refresh failed.");
      await expect(main.getByText("#warmrun", { exact: true })).toBeVisible();
      await main.getByRole("button", { name: "Try again", exact: true }).click();
      await expect(main.getByRole("alert")).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Studio keeps version rows after a failed refresh ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-versions-refresh-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      const versions = main.getByRole("button", { name: "Version history", exact: true });
      await versions.click();
      const history = page.getByRole("dialog", { name: "Version history", exact: true });
      await expect(history.getByText("Keyboard review", { exact: true })).toBeVisible();
      await history.getByRole("button", { name: "Refresh versions", exact: true }).click();
      await expect(history.getByRole("alert")).toContainText("Sample version history refresh failed.");
      await expect(history.getByText("Keyboard review", { exact: true })).toBeVisible();
      await expect(history.getByText("No versions yet. Save changes to create the first.")).toHaveCount(0);
      await history.getByRole("button", { name: "Try again", exact: true }).click();
      await expect(history.getByRole("alert")).toHaveCount(0);
      await page.keyboard.press("Escape");
      await expect(versions).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Studio reports a failed run detail read truthfully ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-run-detail-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await openStudioPane(main, "Runs");
      await expect(main.getByText("#warmrun", { exact: true })).toBeVisible();
      await main.getByText("#warmrun", { exact: true }).click();
      await expect(main.getByRole("alert")).toContainText("Sample run details unavailable.");
      await expect(main.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
      await expect(main.getByText("Run not found.", { exact: true })).toHaveCount(0);
      await main.getByRole("button", { name: "Try again", exact: true }).click();
      await expect(main.getByText("Output snapshot", { exact: true })).toBeVisible();
      await expect(main.getByText("The saved skill produced a read-only preview.", { exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Studio renders a populated run detail read-only ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-run-detail-populated&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await openStudioPane(main, "Runs");
      await expect(main.getByText("#warmrun", { exact: true })).toBeVisible();
      await main.getByText("#warmrun", { exact: true }).click();
      await expect(main.getByText("Output snapshot", { exact: true })).toBeVisible();
      await expect(main.getByText("The saved skill produced a read-only preview.", { exact: true })).toBeVisible();
      await expect(main.getByRole("button", { name: "Re-run", exact: true })).toBeVisible();
      await expect(main.getByRole("link", { name: "Open test task ↗", exact: true })).toBeVisible();
      await main.getByRole("button", { name: "Back", exact: true }).click();
      await expect(main.getByText("#warmrun", { exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
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

for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Skill Studio run denial stays truthful ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-saved&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await openStudioPane(main, "Input");
      await main.getByRole("treeitem", { name: /review\.md/ }).getByText("review.md", { exact: true }).click();
      await openStudioPane(main, "Runs");
      await main.getByRole("button", { name: "Pick an agent", exact: true }).click();
      await page.getByRole("option", { name: /Sage/ }).click();
      const run = main.getByRole("button", { name: "Run", exact: true });
      await expect(run).toBeEnabled();
      await run.click();
      await expect(page.getByText("Couldn't start run", { exact: true })).toBeVisible();
      await expect(main.getByText("#warmrun", { exact: true })).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });

    test(`Skill Studio policy denial explains the boundary ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-catalogs--skill-studio-policy-denied&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await openStudioPane(main, "Input");
      await main.getByRole("treeitem", { name: /review\.md/ }).getByText("review.md", { exact: true }).click();
      await openStudioPane(main, "Runs");
      await main.getByRole("button", { name: "Pick an agent", exact: true }).click();
      await page.getByRole("option", { name: /Sage/ }).click();
      await main.getByRole("button", { name: "Run", exact: true }).click();
      await expect(page.getByText("This action is restricted by your organization policy.", { exact: true })).toBeVisible();
      await expect(main.getByText("#warmrun", { exact: true })).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

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
