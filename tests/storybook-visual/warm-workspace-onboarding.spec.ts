import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    test(`onboarding real wizard first step ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=onboarding-agent-arc--create-your-agent&viewMode=story&globals=theme:${theme}`);
      await expect(page.getByRole("heading", { name: "Create your first agent", exact: true })).toBeVisible();
      const input = page.getByRole("textbox", { name: "Agent name", exact: true });
      await expect(input).toBeVisible();
      const box = (await input.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}
