import { expect, test } from "@playwright/test";

const modes = ["chat-shell", "classic", "production-chat-shell", "production-classic"];
const viewports = [[1440, 900], [1280, 800], [768, 1024], [390, 844]] as const;

for (const mode of modes) {
  for (const theme of ["light", "dark"]) {
    for (const [width, height] of viewports) {
      test(`task panel stays within its own border box: ${mode} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace--task-detail-${mode}&viewMode=story&globals=theme:${theme}`);
        await expect(page.locator('[contenteditable="true"]').first()).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        if (width === 390) {
          const trigger = page.locator('button[title="Properties"]');
          await trigger.focus();
          await page.keyboard.press("Enter");
          const sheet = page.getByRole("dialog");
          await expect(sheet).toBeVisible();
          await expect.poll(() => sheet.evaluate((element) => element.contains(document.activeElement))).toBe(true);
          await page.keyboard.press("Escape");
          if (await sheet.isVisible()) await page.keyboard.press("Escape");
          await expect(sheet).toBeHidden();
          await expect(trigger).toBeFocused();
          return;
        }

        const panel = page.locator("aside").filter({ has: page.locator('section[aria-label="Side panel"], .w-80') });
        const measure = () => panel.evaluate((element) => {
          const outer = element.getBoundingClientRect();
          const inner = element.lastElementChild!.getBoundingClientRect();
          return { left: inner.left - outer.left, right: inner.right - outer.right, width: outer.width };
        });
        await expect.poll(async () => (await measure()).right).toBe(0);
        await expect.poll(async () => (await measure()).left).toBe(0);
        if (mode.includes("classic")) return;

        const grip = page.getByRole("separator", { name: "Resize panel", exact: true });
        const initial = await measure();
        const gripBox = (await grip.boundingBox())!;
        await page.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + 100);
        await page.mouse.down();
        await page.mouse.move(gripBox.x + gripBox.width / 2 - 40, gripBox.y + 100, { steps: 5 });
        await page.mouse.up();
        await expect.poll(async () => (await measure()).right).toBe(0);
        const resized = await measure();
        expect(resized.width).toBeGreaterThanOrEqual(initial.width);
        await page.getByRole("button", { name: "Maximize side panel", exact: true }).click();
        await expect(page.locator('section[data-maximized="true"]')).toBeVisible();
        await expect.poll(async () => (await measure()).right).toBe(0);
        await page.getByRole("button", { name: "Restore side panel", exact: true }).click();
        await expect.poll(measure).toEqual(resized);
        await page.reload();
        await expect(page.locator('[contenteditable="true"]').first()).toBeVisible();
        await expect.poll(measure).toEqual(resized);
      });
    }
  }
}
