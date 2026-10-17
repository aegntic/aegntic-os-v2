import { test, expect, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertModule, connectionInfo } from "../src/contracts.js";
import { createRuntime } from "../src/runtime.js";
import { openStore } from "../src/store.js";
import { startServer } from "../src/server.js";
const disposals = [];
afterEach(async () => { for (const dispose of disposals.splice(0).reverse()) await dispose(); });
function databaseFile() { const dir = mkdtempSync(join(tmpdir(), "aegntic-module-")); disposals.push(() => rmSync(dir, { recursive: true, force: true })); return join(dir, "workspace.db"); }

test("module contracts reject incompatible versions and missing methods without exposing config", () => {
  expect(() => assertModule({ module: { id: "test", kind: "records", contractVersion: 2 }, token: "private-fixture" }, "records")).toThrow("contract");
  const store = openStore(":memory:"); disposals.push(() => store.close());
  expect(() => assertModule({ ...store, reserveRun: null }, "records")).toThrow("reserveRun");
  expect(assertModule(store, "records")).toBe(store);
});

test("runtime closes records when an execution replacement fails validation", () => {
  let closed = false;
  expect(() => createRuntime({ database: ":memory:", recordsFactory: (file) => {
    const store = openStore(file); return { ...store, close() { closed = true; store.close(); } };
  }, executionFactory: () => ({ module: { id: "broken", kind: "execution", contractVersion: 99 } }) })).toThrow("contract");
  expect(closed).toBe(true);
});

test("HTTP workspace accepts explicit replacement modules and reports only safe module metadata", async () => {
  let connections = 0; let recordCalls = 0;
  const app = startServer({ port: 0, database: databaseFile(), recordsFactory(file) {
    const store = openStore(file); return { ...store, module: { ...store.module, id: "records-fixture" }, list() { recordCalls++; return store.list(); } };
  }, executionFactory: () => ({
    module: { id: "fixture-executor", kind: "execution", contractVersion: 1, runOwner: "fixture-executor/v1" },
    secret: "never-serialize-fixture", endpoint: "https://private.example.invalid",
    async connection() { connections++; return { status: "NOT_CONNECTED", detail: "Explicit fixture; no provider traffic." }; },
    async dispatch() { throw Error("No fixture dispatch"); }, async refresh() { return null; }, async abort() { return null; },
  }) }); disposals.push(() => app.stop());
  const systemResponse = await fetch(new URL("/api/system", app.server.url));
  expect(systemResponse.status).toBe(200); const system = await systemResponse.json();
  expect(system.contractVersion).toBe(1);
  expect(system.modules.find((m) => m.kind === "records").id).toBe("records-fixture");
  expect(system.modules.find((m) => m.kind === "execution").id).toBe("fixture-executor");
  expect(system.modules.find((m) => m.id === "convex").status).toBe("NOT_CONNECTED");
  expect(JSON.stringify(system)).not.toContain("never-serialize"); expect(JSON.stringify(system)).not.toContain("private.example");
  const workspace = await (await fetch(new URL("/api/workspace", app.server.url))).json();
  expect(workspace.outcomes).toHaveLength(5); expect(recordCalls).toBe(1); expect(connections).toBe(2);
  const forbidden = await fetch(new URL("/api/system", app.server.url), { headers: { Origin: "https://untrusted.example" } }); expect(forbidden.status).toBe(403);
});

test("legacy SQLite run migration preserves identity, results and default execution owner across restarts", () => {
  const file = databaseFile(); let store = openStore(file);
  const p = store.create({ title: "Migration fixture", outcome: "product-foundry", objective: "Preserve previous execution records." }, "migration-fixture").project;
  store.saveCreative(p.id, { revision: 0, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com", graphics: "TEST FIXTURE", video: "TEST FIXTURE", duration: 45 }); store.approveCreative(p.id, { revision: 1, confirmed: true });
  const run = store.reserveRun(p.id, 1, "fixture-device", { id: "fixture-model" }, () => "/fixture-only");
  store.updateRun(run.id, { sessionId: "fixture-session", submissionId: 10, state: "DONE", result: "Retain this result" }); store.close();
  const db = new Database(file); db.exec("ALTER TABLE runs DROP COLUMN execution_owner"); db.close();
  for (let i = 0; i < 2; i++) {
    store = openStore(file); try {
      const restored = store.run(run.id); expect(restored.executionOwner).toBe("pi-durable/v1"); expect(restored.sessionId).toBe("fixture-session"); expect(restored.submissionId).toBe(10); expect(restored.result).toBe("Retain this result"); expect(store.project(p.id).creativeReady).toBe(true);
    } finally { store.close(); }
  }
});

test("connection contract rejects missing connected identity and strips extra fields", () => {
  expect(() => connectionInfo({ status: "CONNECTED", detail: "Missing model" })).toThrow("identity");
  expect(connectionInfo({ status: "NOT_CONNECTED", detail: "No service", token: "private-fixture" })).toEqual({ status: "NOT_CONNECTED", detail: "No service" });
});

test("replacing an executor cannot touch an active run owned by the earlier implementation", async () => {
  const file = databaseFile(); let touched = 0;
  const runtime = createRuntime({ database: file, executionFactory: () => ({
    module: { id: "replacement", kind: "execution", contractVersion: 1, runOwner: "replacement/v1" },
    async connection() { return { status: "NOT_CONNECTED", detail: "Fixture" }; },
    async dispatch() { touched++; }, async refresh() { touched++; }, async abort() { touched++; },
  }) }); disposals.push(() => runtime.store.close());
  const store = runtime.store;
  const p = store.create({ title: "Replacement fixture", outcome: "product-foundry", objective: "Do not redirect previous runs." }, "replacement-fixture").project;
  store.saveCreative(p.id, { revision: 0, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com", graphics: "TEST FIXTURE", video: "TEST FIXTURE", duration: 45 }); store.approveCreative(p.id, { revision: 1, confirmed: true });
  const run = store.reserveRun(p.id, 1, "original-device", { id: "fixture-model" }, () => "/fixture-only");
  for (const operation of [() => runtime.execution.dispatch(p.id, { revision: 1 }), () => runtime.execution.refresh(p.id), () => runtime.execution.abort(p.id, run.id)]) {
    await expect(operation()).rejects.toMatchObject({ code: "EXECUTION_OWNER_MISMATCH", status: 409 });
  }
  expect(touched).toBe(0); expect(store.run(run.id).state).toBe("PREPARING");
  // Finishing the previous run permits a genuinely new approved revision on another owner.
  store.updateRun(run.id, { state: "DONE" });
  store.saveCreative(p.id, { revision: 1, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com", graphics: "TEST FIXTURE 2", video: "TEST FIXTURE", duration: 45 }); store.approveCreative(p.id, { revision: 2, confirmed: true });
  await runtime.execution.dispatch(p.id, { revision: 2 }); expect(touched).toBe(1);
});

test("module identity must be a string and cannot serialize arbitrary metadata", () => {
  const store = openStore(":memory:"); disposals.push(() => store.close());
  for (const id of [undefined, null, true, { toString() { return "valid-looking"; }, secret: "private-fixture" }]) {
    expect(() => assertModule({ ...store, module: { ...store.module, id } }, "records")).toThrow("contract");
  }
});

test("bind/startup failure closes the injected records handle", () => {
  let closed = false;
  expect(() => startServer({ port: -1, database: ":memory:", recordsFactory(file) {
    const store = openStore(file); return { ...store, close() { closed = true; store.close(); } };
  } })).toThrow();
  expect(closed).toBe(true);
});
