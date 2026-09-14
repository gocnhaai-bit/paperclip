import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const story of ["goals-list-populated", "goals-list-production-layout", "goal-detail-populated", "goal-detail-production-layout"]) {
      test(`Goals real route ${story} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace-goals--${story}&viewMode=story&globals=theme:${theme}`);
        if (story.startsWith("goals-list")) {
          const goal = page.getByRole("link", { name: /Tighten board operator visibility/ });
          await expect(goal).toBeVisible();
          await goal.click();
        }
        await expect(page.getByRole("heading", { name: "Tighten board operator visibility", exact: true })).toBeVisible();
        await expect(page.getByRole("tab", { name: /Sub-Goals/ })).toBeVisible();
        await page.getByRole("tab", { name: /Projects/ }).click();
        await expect(page.getByRole("link", { name: /Board UI/ }).last()).toBeVisible();
        if (width === 390) {
          const trigger = page.getByRole("button", { name: "Show goal properties", exact: true });
          await trigger.focus();
          await page.keyboard.press("Enter");
          const sheet = page.getByRole("dialog");
          await expect(sheet.getByRole("heading", { name: "Goal properties" })).toBeVisible();
          await expect(sheet.getByText("Owner", { exact: true })).toBeVisible();
          await expect(sheet.getByRole("link", { name: "CodexCoder", exact: true })).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(sheet).toBeHidden();
          await expect(trigger).toBeFocused();
        }
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        if (width === 390 && theme === "light") await page.screenshot({ path: `/tmp/warm-goals-${story}.png` });
      });
    }
  }
}

for (const story of ["goals-list-empty", "goals-list-loading", "goals-list-error", "goal-detail-empty", "goal-detail-loading", "goal-detail-error"]) {
  test(`Goals data state ${story}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=pages-warm-workspace-goals--${story}&viewMode=story&globals=theme:dark`);
    if (story.endsWith("error")) {
      await expect(page.getByText(/Sample goals? could not be loaded/)).toBeVisible();
    } else if (story.endsWith("loading")) {
      await expect(page.locator('main [data-slot="skeleton"]').first()).toBeVisible();
    } else if (story.startsWith("goals-list")) {
      await expect(page.getByText("No goals yet.")).toBeVisible();
    } else {
      await expect(page.getByText("No sub-goals.")).toBeVisible();
      await page.getByRole("tab", { name: /Projects/ }).click();
      await expect(page.getByText("No linked projects.")).toBeVisible();
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
}
