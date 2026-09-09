import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const uiRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));

describe("PWA install mode", () => {
  it("opens home-screen launches with browser controls visible", () => {
    const manifest = JSON.parse(readFileSync(resolve(uiRoot, "public/site.webmanifest"), "utf8")) as {
      display?: string;
      name?: string;
      short_name?: string;
    };
    const html = readFileSync(resolve(uiRoot, "index.html"), "utf8");

    expect(manifest.display).toBe("browser");
    expect(manifest.name).toBe("Paperclip for SMIT");
    expect(manifest.short_name).toBe("Paperclip for SMIT");
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="Paperclip for SMIT" />');
    expect(html).toContain("<title>Paperclip for SMIT</title>");
    expect(html).not.toContain('name="mobile-web-app-capable"');
    expect(html).not.toContain('name="apple-mobile-web-app-capable"');
    expect(html).not.toContain('name="apple-mobile-web-app-status-bar-style"');
  });

  it("ships the approved theme-aware SMIT paperclip icon set", () => {
    const favicon = readFileSync(resolve(uiRoot, "public/favicon.svg"), "utf8");
    expect(favicon).toContain("#1f7a3a");
    expect(favicon).toContain("#65c77d");

    for (const file of [
      "favicon-16x16.png",
      "favicon-32x32.png",
      "favicon.ico",
      "apple-touch-icon.png",
      "android-chrome-192x192.png",
      "android-chrome-512x512.png",
    ]) {
      expect(readFileSync(resolve(uiRoot, "public", file)).byteLength).toBeGreaterThan(
        file === "favicon.ico" ? 10_000 : 100,
      );
    }
  });

  it("fetches the manifest with credentials so authenticating proxies can serve it", () => {
    const html = readFileSync(resolve(uiRoot, "index.html"), "utf8");

    // Browsers fetch <link rel="manifest"> in "omit credentials" mode unless
    // the link opts in. Behind an authenticating reverse proxy (e.g. a
    // managed-hosting front door), the cookie-less request is rejected on
    // every page load.
    expect(html).toContain('rel="manifest" href="/site.webmanifest" crossorigin="use-credentials"');
  });
});
