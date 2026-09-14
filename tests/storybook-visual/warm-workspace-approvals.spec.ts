import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const story of ["approvals-list-populated", "approval-detail-populated", "approval-detail-production-layout", "approval-detail-linked-task"]) {
      test(`Approvals real route ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-approvals--${story}&viewMode=story&globals=theme:${theme}`);
        const main = page.locator("main");
        if (story.startsWith("approvals-list")) {
          await expect(main.getByRole("link").first()).toBeVisible();
        } else {
          await expect(main.getByRole("heading", { name: /Comments/ })).toBeVisible();
          await main.getByRole("button", { name: "See full request", exact: true }).click();
          await expect(main.locator("pre")).toBeVisible();
          if (story.endsWith("linked-task")) await expect(main.getByText("Linked Tasks", { exact: true })).toBeVisible();
          else await expect(main.getByRole("button", { name: "Approve", exact: true })).toBeVisible();
        }
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

test("approval read errors are not mislabeled as missing records", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace-approvals--approval-detail-error&viewMode=story");
  await expect(page.getByText("Sample approval could not be loaded.", { exact: true })).toBeVisible();
  await expect(page.getByText("Approval not found.", { exact: true })).toHaveCount(0);
});
