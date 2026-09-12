"use strict";

const STATES = new Set([
  "accepted",
  "running",
  "cleanup_pending",
  "completed",
  "cancelled",
  "timed_out",
  "failed",
]);

function parseStdoutLine(line, ts) {
  const text = String(line).trim();
  if (!text) return [];
  try {
    const value = JSON.parse(text);
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 1 &&
      STATES.has(value.state)
    ) {
      return [{ kind: "system", ts, text: `[dsh-ssh] state=${value.state}` }];
    }
  } catch {
    // Only safe structured runner status lines are recognized.
  }
  return [];
}

module.exports = { parseStdoutLine };
