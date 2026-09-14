import { readFileSync } from "node:fs";

const attachment = JSON.parse(readFileSync(
  new URL("../ui/storybook/fixtures/warm-workspace-attachment.json", import.meta.url),
  "utf8",
));
const contentPath = `/api/attachments/${attachment.id}/content`;

export function serveWarmWorkspaceAttachment(req, res, next) {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname !== contentPath) return next();
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(403, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "This preview is read-only." }));
    return;
  }
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
  res.writeHead(200, {
    "content-type": `${attachment.contentType}; charset=utf-8`,
    "content-disposition": `${disposition}; filename="${attachment.filename}"`,
    "content-length": Buffer.byteLength(attachment.body),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(req.method === "HEAD" ? undefined : attachment.body);
}
