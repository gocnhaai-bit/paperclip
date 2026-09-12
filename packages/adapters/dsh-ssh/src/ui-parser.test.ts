import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);
const { parseStdoutLine } = require("../ui-parser.cjs") as {
  parseStdoutLine: (line: string, ts: string) => unknown[];
};

describe("dsh SSH UI parser", () => {
  test("emits only exact safe runner states", () => {
    expect(parseStdoutLine('{"state":"running"}', "now")).toEqual([{ kind: "system", ts: "now", text: "[dsh-ssh] state=running" }]);
    expect(parseStdoutLine('{"state":"completed_but_not_really"}', "now")).toEqual([]);
    expect(parseStdoutLine('{"state":"running","task":"secret"}', "now")).toEqual([]);
    expect(parseStdoutLine("unstructured runner output", "now")).toEqual([]);
  });
});
