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

for (const story of ["mine-error", "legacy-mine-error"]) {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    for (const theme of ["light", "dark"]) {
      test(`Inbox failure is not an empty inbox ${story} ${width} ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-inbox--${story}&viewMode=story&globals=theme:${theme}`);
        await expect(page.locator("main").getByRole("alert")).toContainText("Sample inbox could not be loaded.");
        await expect(page.getByText("Inbox zero.", { exact: true })).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

test("Inbox tabs and search update the actual list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=pages-warm-workspace-inbox--streamlined-mine&viewMode=story");
  const main = page.locator("main");
  const search = main.getByPlaceholder("Search inbox…").filter({ visible: true });
  await search.fill("no-such-inbox-task");
  await expect(main.getByText("No inbox items match your search.", { exact: true })).toBeVisible();
  await main.getByRole("tab", { name: "Recent", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(main.getByRole("link", { name: /PAP-/ }).first()).toBeVisible();
  await main.getByRole("tab", { name: "Blocked", exact: true }).click();
  await expect(main.getByRole("tab", { name: "Blocked", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(main.getByRole("link", { name: /PAP-/ }).first()).toBeVisible();
});

test("Inbox blocked errors are visible", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-inbox--blocked-error&viewMode=story");
  await expect(page.getByTestId("blocked-inbox-error")).toBeVisible();
});
