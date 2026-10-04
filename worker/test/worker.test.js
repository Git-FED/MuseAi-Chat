import test from "node:test";
import assert from "node:assert/strict";

test("worker source contains the public protocol endpoints", async () => {
  const source = await (await import("node:fs/promises")).readFile(new URL("../worker.js", import.meta.url), "utf8");
  assert.match(source, /\/send/);
  assert.match(source, /\/inbox/);
  assert.match(source, /\/health/);
});
