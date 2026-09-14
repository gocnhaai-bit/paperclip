import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import sample from "../../ui/storybook/fixtures/warm-workspace-attachment.json" with { type: "json" };

const contentPath = `/api/attachments/${sample.id}/content`;

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    for (const mode of ["long-content", "long-content-classic"]) {
      test(`long task content remains contained at ${width} ${theme} ${mode}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`/iframe.html?id=pages-warm-workspace--task-detail-${mode}&viewMode=story&globals=theme:${theme}`);
        await expect(page.locator('[contenteditable="true"]').first()).toBeVisible();
        await expect(page.getByRole("heading", { name: "WorkspaceReview".repeat(24), exact: true })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        const composer = page.locator('[contenteditable="true"]').first();
        await composer.scrollIntoViewIfNeeded();
        await expect.poll(() => composer.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.left >= 0 && rect.right <= innerWidth && rect.bottom > 0 && rect.top < innerHeight;
        })).toBe(true);
      });
    }
    test(`comment deep link automatically reveals its target at ${width} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/iframe.html?id=pages-warm-workspace--task-detail-comment-link&viewMode=story&globals=theme:${theme}`);
      const target = page.locator("#comment-warm-comment-4");
      await expect(target).toBeAttached();
      // Measuring only: no locator click/focus/scroll may reveal this target for the app.
      await expect.poll(() => target.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const viewport = element.closest(".task-chat-scroll-viewport")?.getBoundingClientRect();
        const top = Math.max(0, viewport?.top ?? 0);
        const bottom = Math.min(innerHeight, viewport?.bottom ?? innerHeight);
        return rect.top >= top - 1 && rect.top < bottom && rect.bottom > top;
      })).toBe(true);
    });
  }
}

test("reopening the same plan link restores its panel after closing", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/iframe.html?id=pages-warm-workspace--task-detail-chat-shell&viewMode=story");
  const plan = page.getByRole("link", { name: "Open Plan revision 1", exact: true });
  await plan.click();
  const panel = page.locator('section[aria-label="Side panel"]');
  await expect(panel.getByRole("heading", { name: "Workspace layout review", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close side panel", exact: true }).click();
  await expect.poll(() => panel.evaluate((element) => element.closest("aside")!.getBoundingClientRect().width)).toBe(0);
  const hiddenControl = page.locator('aside [aria-label="Maximize side panel"]');
  await hiddenControl.evaluate((element: HTMLElement) => element.focus());
  await expect(hiddenControl).not.toBeFocused();
  await plan.click();
  await expect(panel.getByRole("heading", { name: "Workspace layout review", exact: true })).toBeVisible();
});

test("task switching and router back/forward restore the plan without leaking it", async ({ page }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace--task-detail-navigation&viewMode=story");
  const panel = page.locator('section[aria-label="Side panel"]');
  await expect(panel.getByRole("heading", { name: "Workspace layout review", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Other sample task", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Verify navigation between sample tasks", exact: true })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Workspace layout review", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Preview back", exact: true }).click();
  await expect(panel.getByRole("heading", { name: "Workspace layout review", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Preview forward", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Verify navigation between sample tasks", exact: true })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Workspace layout review", exact: true })).toHaveCount(0);
});

test("work-product link opens the local attachment and download returns its exact bytes", async ({ page, request }) => {
  await page.goto("/iframe.html?id=pages-warm-workspace--task-detail-chat-shell&viewMode=story");
  const link = page.getByRole("link", { name: "Open preview: Workspace layout review notes", exact: true });
  await expect(link).toHaveAttribute("href", contentPath);
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${contentPath}$`));
  await expect(page.locator("body")).toContainText(sample.body.trim());

  // Direct API navigation (not window.fetch) is the download contract used by attachment links.
  const response = await request.get(`${contentPath}?download=1`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-disposition"]).toBe(`attachment; filename="${sample.filename}"`);
  const downloadPromise = page.waitForEvent("download");
  await page.goto(`${contentPath}?download=1`).catch((error) => {
    if (!String(error).includes("Download is starting")) throw error;
  });
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(sample.filename);
  const bytes = await readFile((await download.path())!);
  expect(bytes.toString()).toBe(sample.body);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe("e57c1e3a8cefdaceef9ca1438d9d84e142247a166f4019acf5df0ef8e883de47");
});
