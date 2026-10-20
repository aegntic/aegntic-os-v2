import { test, expect } from "bun:test";
import { createPiClient } from "../src/pi-client.js";

test("Pi admits only explicitly qualified runtime versions", async () => {
  for (const version of ["1.0.3", "1.1.0", "1.0.4", "1.2.0", "2.0.0", null]) {
    const pi = createPiClient({ url: "http://127.0.0.1:4318", token: "synthetic-credential-".repeat(3), workspaceRoot: "/unused-version-test", fetchImpl: async () => Response.json({ aegnticRecovery: 1, apiVersion: 1, durableVersion: version, uid: "fixture", models: [] }) });
    if (["1.0.3", "1.1.0"].includes(version)) await expect(pi.device()).resolves.toMatchObject({ durableVersion: version });
    else await expect(pi.device()).rejects.toMatchObject({ code: "PI_INCOMPATIBLE" });
  }
});
