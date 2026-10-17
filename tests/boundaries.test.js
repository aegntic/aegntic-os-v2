import { test, expect } from "bun:test";
import { readdirSync } from "node:fs";

// Keep framework, persistence and provider imports on their respective sides.
// Source: https://bun.com/docs/runtime/transpiler#scan
const boundaries = {
  "catalogue.js": [],
  "errors.js": [],
  "contracts.js": ["./errors.js"],
  "store.js": ["bun:sqlite", "node:crypto", "node:fs", "node:path", "./catalogue.js", "./errors.js", "./contracts.js"],
  "pi-client.js": ["node:fs", "node:path", "./errors.js"],
  "execution.js": ["./errors.js", "./contracts.js"],
  "runtime.js": ["./store.js", "./execution.js", "./contracts.js"],
  // Includes the local CLI composition entry, which alone reads provider config.
  "server.js": ["node:path", "node:url", "./catalogue.js", "./errors.js", "./pi-client.js", "./runtime.js"],
};
test("source modules obey explicit import boundaries", async () => {
  const source = new URL("../src/", import.meta.url);
  expect(readdirSync(source).filter((name) => name.endsWith(".js")).sort()).toEqual(Object.keys(boundaries).sort());
  const scanner = new Bun.Transpiler({ loader: "js" });
  for (const [name, allowed] of Object.entries(boundaries)) {
    const { imports } = scanner.scan(await Bun.file(new URL(name, source)).text());
    for (const imported of imports) expect(allowed, `${name} cannot import ${imported.path}`).toContain(imported.path);
  }
});
