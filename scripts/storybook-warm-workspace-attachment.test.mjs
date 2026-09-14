import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { serveWarmWorkspaceAttachment } from "./storybook-warm-workspace-attachment.mjs";

const sample = JSON.parse(readFileSync(new URL("../ui/storybook/fixtures/warm-workspace-attachment.json", import.meta.url), "utf8"));

test("serves only the sample attachment with distinct open/download dispositions", async () => {
  const server = createServer((req, res) => serveWarmWorkspaceAttachment(req, res, () => {
    res.writeHead(404).end("not found");
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/attachments/${sample.id}/content`;
  try {
    for (const query of ["", "?download=1"]) {
      const response = await fetch(base + query);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-disposition"), `${query ? "attachment" : "inline"}; filename="${sample.filename}"`);
      assert.equal(await response.text(), sample.body);
    }
    assert.equal((await fetch(base, { method: "POST" })).status, 403);
    assert.equal((await fetch(base + "/missing")).status, 404);
    const head = await fetch(base, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
