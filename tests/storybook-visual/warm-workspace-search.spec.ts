import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`actual Search results ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=product-search-command-k--full-shell-results&viewMode=story&globals=theme:${theme}`);
      await expect(page.getByRole("textbox", { name: "Search query", exact: true })).toHaveValue("auth");
      await expect(page.locator("main").getByText(/Auth middleware flakes on cold-start/).first()).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}
test("actual Search exposes load failure", async ({ page }) => {
  await page.goto("/iframe.html?id=product-search-command-k--full-shell-error&viewMode=story");
  await expect(page.getByText("Couldn’t run that search", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
});
