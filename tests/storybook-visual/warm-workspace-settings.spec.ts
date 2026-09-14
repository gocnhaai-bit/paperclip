import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`Environment create form can be cancelled ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/iframe.html?id=pages-warm-workspace-settings--environments-empty&viewMode=story");
    const main = page.locator("main");
    await main.getByRole("link", { name: "Add environment", exact: true }).click();
    await expect(main.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
    await main.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(main.getByRole("combobox", { name: "Default environment" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

for (const state of ["error", "loading"]) {
  for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
    for (const theme of ["light", "dark"]) {
      test(`Environment list ${state} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-settings--environments-${state}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        await expect(main.getByText(state === "error" ? "Sample environments unavailable." : "Loading environments…", { exact: true })).toBeVisible();
        await expect(main.getByRole("combobox", { name: "Default environment" })).toBeDisabled();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Plugin settings config failure ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-settings--plugin-config-error&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { name: "Settings sample", exact: true })).toBeVisible();
      await expect(main.getByRole("alert")).toContainText("Sample configuration unavailable.");
      await expect(main.getByRole("textbox")).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}
for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Plugin settings configuration and status ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-settings--plugin-details&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { name: "Settings sample", exact: true })).toBeVisible();
      await expect(main.getByRole("textbox").first()).toBeVisible();
      if (width < 640) await main.getByRole("combobox", { name: "Page section" }).selectOption("status");
      else await main.getByRole("tab", { name: "Status", exact: true }).click();
      await expect(main.getByRole("textbox")).toHaveCount(0);
      if (width < 640) await main.getByRole("combobox", { name: "Page section" }).selectOption("configuration");
      else await main.getByRole("tab", { name: "Configuration", exact: true }).click();
      await expect(main.getByRole("textbox").first()).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

test("Plugin settings detail failure stays on its error surface", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-settings--plugin-details-error&viewMode=story");
  await expect(page.locator("main").getByRole("alert")).toContainText("Sample plugin details unavailable.");
  await expect(page.getByRole("heading", { name: "Plugin Manager", exact: true })).toHaveCount(0);
});

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Adapter Manager install form Cancel ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-settings--adapters-page&viewMode=story&globals=theme:${theme}`);
      const opener = page.locator("main").getByRole("button", { name: "Install Adapter", exact: true });
      await opener.click();
      const dialog = page.getByRole("dialog", { name: "Install External Adapter" });
      await expect(dialog.getByRole("button", { name: "Install", exact: true })).toBeDisabled();
      await dialog.getByRole("button", { name: "Local path", exact: true }).click();
      await expect(dialog.getByRole("textbox", { name: "Path to adapter package" })).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

test("Adapter Manager announces a failed read", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=pages-warm-workspace-settings--adapters-error&viewMode=story&globals=theme:dark");
  await expect(page.locator("main").getByRole("alert")).toContainText("Sample adapter list unavailable.");
});

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Plugin Manager inspection and install Cancel ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-settings--plugins-empty&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { name: "Plugin Manager", exact: true })).toBeVisible();
      await expect(main.getByText("No plugins installed", { exact: true })).toBeVisible();
      const opener = main.getByRole("button", { name: "Install Plugin", exact: true }).first();
      await opener.click();
      const dialog = page.getByRole("dialog", { name: "Install Plugin", exact: true });
      await expect(dialog.getByRole("button", { name: "Install", exact: true })).toBeDisabled();
      await dialog.getByRole("textbox", { name: "npm Package Name" }).fill("@example/local-preview");
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}
for (const [state, message] of [["loading", "Loading plugins..."], ["error", "Failed to load plugins."]]) {
  test(`Plugin Manager ${state}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=pages-warm-workspace-settings--plugins-${state}&viewMode=story&globals=theme:dark`);
    await expect(page.locator("main").getByText(message, { exact: true })).toBeVisible();
    await expect(page.getByText("No plugins installed", { exact: true })).toHaveCount(0);
  });
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Instance Access search and inspect ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-settings--instance-access-page&viewMode=story&globals=theme:${theme}`);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { name: "Instance Access", exact: true })).toBeVisible();
      await expect(main.getByText("owner • active", { exact: true })).toBeVisible();
      await main.getByRole("textbox", { name: "Search users" }).fill("Board");
      await expect(main.getByText("1 active organization memberships", { exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const [state, message] of [
  ["forbidden", "Instance admin access is required to manage users."],
  ["error", "Sample user directory unavailable."],
  ["empty", "Select a user to inspect instance access."],
  ["loading", "Loading instance access…"],
]) {
  test(`Instance Access ${state}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=pages-warm-workspace-settings--instance-access-${state}&viewMode=story&globals=theme:dark`);
    await expect(page.locator("main").getByText(message, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save organization access", exact: true })).toHaveCount(0);
  });
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Members edit can be cancelled ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-settings--members&viewMode=story&globals=theme:${theme}`);
      const row = page.getByRole("row").filter({ hasText: "Board Operator" });
      await expect(row).toBeVisible();
      await expect(row.getByRole("button", { name: "Remove", exact: true })).toBeDisabled();
      await row.getByRole("button", { name: "Edit", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: "Edit member", exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(row.getByRole("button", { name: "Edit", exact: true })).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const width of [1440, 390]) {
  test(`Members removal can be cancelled without a mutation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/iframe.html?id=pages-warm-workspace-settings--members&viewMode=story");
    const trigger = page.getByRole("row").filter({ hasText: "Preview Member" }).getByRole("button", { name: "Remove", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test("hidden Members route returns to settings without rendering membership controls", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-settings--members-hidden&viewMode=story");
  await expect(page.locator("main").getByRole("textbox").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Organization Members", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveCount(0);
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`Secrets metadata search at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/iframe.html?id=pages-warm-workspace-settings--secrets-metadata&viewMode=story");
    const search = page.getByPlaceholder("Search by name, key, ref");
    await expect(search).toBeVisible();
    await search.fill("no-such-sample-metadata");
    await expect(page.getByText("No secrets match your search.", { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

for (const state of ["empty", "loading"]) {
  test(`Secrets ${state} state`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=pages-warm-workspace-settings--secrets-${state}&viewMode=story&globals=theme:dark`);
    if (state === "loading") await expect(page.getByTestId("secrets-loading-skeleton")).toBeVisible();
    else await expect(page.getByText("No secrets yet. Create a shared organization secret or one that each user supplies.")).toBeVisible();
  });
}

test("Secrets retry restores metadata after a transient read failure", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-settings--secrets-retry&viewMode=story");
  await expect(page.getByText("Sample secret metadata could not be loaded.")).toBeVisible();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByText("Sample secret metadata could not be loaded.")).toHaveCount(0);
  const search = page.getByPlaceholder("Search by name, key, ref");
  await search.fill("no-such-sample-metadata");
  await expect(page.getByText("No secrets match your search.", { exact: true })).toBeVisible();
});

test("Secrets metadata failure is visible", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-settings--secrets-error&viewMode=story");
  await expect(page.getByText("Sample secret metadata could not be loaded.")).toBeVisible();
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`Experimental settings read-only layout ${width} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace-settings--experimental&viewMode=story&globals=theme:${theme}`);
      await expect(page.getByText("Experimental features may break at any time.", { exact: true })).toBeVisible();
      await expect(page.locator("main").getByRole("switch").first()).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

for (const state of ["empty", "loading", "error", "forbidden"]) {
  test(`Members ${state} state`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=pages-warm-workspace-settings--members-${state}&viewMode=story&globals=theme:dark`);
    const message = state === "empty" ? "No user memberships found for this organization yet."
      : state === "loading" ? "Loading organization access…"
      : state === "forbidden" ? "You do not have permission to manage organization members."
      : "Sample members could not be loaded.";
    await expect(page.getByText(message, { exact: true })).toBeVisible();
  });
}


for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const story of ["company", "profile"]) {
      test(`Settings ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-settings--${story}&viewMode=story&globals=theme:${theme}`);
        await expect(page.locator("main").getByRole("textbox").first()).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}
