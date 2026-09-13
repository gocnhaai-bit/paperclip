import { describe, expect, it, vi } from "vitest";
import {
  guardedHttpAdapterFetch,
  httpAdapterPrivateEndpointAllowlist,
} from "../adapters/http/remote-fetch.js";

describe("HTTP adapter guarded fetch", () => {
  it("parses only comma-separated exact HTTP(S) origins", () => {
    const allowlist = httpAdapterPrivateEndpointAllowlist([
      "http://127.0.0.1:3100",
      "HTTPS://INTERNAL.EXAMPLE:8443/",
      "https://internal.example/path",
      "https://user:pass@internal.example",
      "file:///tmp/socket",
      "not-a-url",
    ].join(","));

    expect([...allowlist]).toEqual([
      "http://127.0.0.1:3100",
      "https://internal.example:8443",
    ]);
  });

  it("allows public HTTP(S) endpoints by default and rejects redirects", async () => {
    const unpinnedFetch = vi.fn(async () => new Response(null, {
      status: 302,
      headers: { location: "http://127.0.0.1/admin" },
    }));

    await expect(guardedHttpAdapterFetch("https://93.184.216.34/hook", {
      method: "POST",
    }, { unpinnedFetch })).rejects.toMatchObject({
      code: "remote_http_redirect_disallowed",
    });

    expect(unpinnedFetch).toHaveBeenCalledWith(
      "https://93.184.216.34/hook",
      expect.objectContaining({ method: "POST", redirect: "manual" }),
    );
  });

  it.each([
    "http://127.0.0.1:3100/hook",
    "http://10.0.0.8/hook",
    "http://172.16.0.8/hook",
    "http://192.168.1.8/hook",
  ])("blocks private endpoint %s unless its exact origin is allowlisted", async (url) => {
    const unpinnedFetch = vi.fn();

    await expect(guardedHttpAdapterFetch(url, {}, { unpinnedFetch }))
      .rejects.toMatchObject({ code: "remote_http_private_endpoint" });
    expect(unpinnedFetch).not.toHaveBeenCalled();
  });

  it("allows only the exact DSH bridge URL to reach a private tailnet address", async () => {
    const socketFactory = vi.fn(() => {
      throw new Error("DSH bridge dial attempted");
    });

    await expect(guardedHttpAdapterFetch(
      "https://AGENT-BAQUAN-HERMES.TAIL9452C0.TS.NET:8447/run",
      {},
      {
        privateEndpointAllowlist: new Set(),
        lookup: async () => [{ address: "100.115.143.1", family: 4 }],
        socketFactory,
      },
    )).rejects.toThrow("DSH bridge dial attempted");
    expect(socketFactory).toHaveBeenCalledOnce();
  });

  it.each([
    "http://agent-baquan-hermes.tail9452c0.ts.net:8447/run",
    "https://other.tail9452c0.ts.net:8447/run",
    "https://agent-baquan-hermes.tail9452c0.ts.net:8445/run",
    "https://agent-baquan-hermes.tail9452c0.ts.net:8447/",
    "https://agent-baquan-hermes.tail9452c0.ts.net:8447/run/",
    "https://agent-baquan-hermes.tail9452c0.ts.net:8447/run?mode=headless",
    "https://agent-baquan-hermes.tail9452c0.ts.net:8447/run#fragment",
    "https://user@agent-baquan-hermes.tail9452c0.ts.net:8447/run",
  ])("does not bypass the private-network guard for DSH bridge variant %s", async (url) => {
    const socketFactory = vi.fn();

    await expect(guardedHttpAdapterFetch(url, {}, {
      privateEndpointAllowlist: new Set(),
      lookup: async () => [{ address: "100.115.143.1", family: 4 }],
      socketFactory,
    })).rejects.toMatchObject({ code: "remote_http_private_endpoint" });
    expect(socketFactory).not.toHaveBeenCalled();
  });

  it("does not bypass the private-network guard for a tailnet IP URL", async () => {
    const unpinnedFetch = vi.fn();

    await expect(guardedHttpAdapterFetch("https://100.115.143.1:8447/run", {}, {
      privateEndpointAllowlist: new Set(),
      unpinnedFetch,
    })).rejects.toMatchObject({ code: "remote_http_private_endpoint" });
    expect(unpinnedFetch).not.toHaveBeenCalled();
  });

  it("still rejects link-local DNS results for the exact DSH bridge URL", async () => {
    const socketFactory = vi.fn();

    await expect(guardedHttpAdapterFetch(
      "https://agent-baquan-hermes.tail9452c0.ts.net:8447/run",
      {},
      {
        lookup: async () => [{ address: "169.254.169.254", family: 4 }],
        socketFactory,
      },
    )).rejects.toMatchObject({ code: "remote_http_private_endpoint" });
    expect(socketFactory).not.toHaveBeenCalled();
  });

  it("allows an exact private origin without allowing a sibling port", async () => {
    const unpinnedFetch = vi.fn(async () => new Response("ok", { status: 200 }));
    const privateEndpointAllowlist = new Set(["http://127.0.0.1:3100"]);

    const response = await guardedHttpAdapterFetch("http://127.0.0.1:3100/hook", {}, {
      privateEndpointAllowlist,
      unpinnedFetch,
    });
    expect(response.status).toBe(200);

    await expect(guardedHttpAdapterFetch("http://127.0.0.1:3101/hook", {}, {
      privateEndpointAllowlist,
      unpinnedFetch,
    })).rejects.toMatchObject({ code: "remote_http_private_endpoint" });
  });

  it("rejects metadata link-local addresses even when their origin is allowlisted", async () => {
    const unpinnedFetch = vi.fn();

    await expect(guardedHttpAdapterFetch("http://169.254.169.254/latest/meta-data/", {}, {
      privateEndpointAllowlist: new Set(["http://169.254.169.254"]),
      unpinnedFetch,
    })).rejects.toMatchObject({ code: "remote_http_private_endpoint" });
    expect(unpinnedFetch).not.toHaveBeenCalled();
  });

  it("rejects private DNS results before opening a socket", async () => {
    const socketFactory = vi.fn(() => {
      throw new Error("must not dial");
    });

    await expect(guardedHttpAdapterFetch("http://internal.example/hook", {}, {
      lookup: async () => [{ address: "10.0.0.8", family: 4 }],
      socketFactory,
    })).rejects.toMatchObject({ code: "remote_http_private_endpoint" });
    expect(socketFactory).not.toHaveBeenCalled();
  });
});
