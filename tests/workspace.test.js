import { test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openStore, controls } from "../src/store.js";
import { startServer } from "../src/server.js";
const dirs = [];
const payload = { title: "First useful slice", outcome: "product-foundry", objective: "Save a brief and preserve evidence across restart." };
function file() { const directory = mkdtempSync(join(tmpdir(), "aegntic-test-")); dirs.push(directory); return join(directory, "workspace.db"); }
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
test("brief and review survive closing and reopening the database", () => {
  const filename = file(); let store = openStore(filename); const created = store.create(payload, "restart-case").project;
  store.review(created.id, "C2", { status: "pass", evidence: "Browser request inspection: no remote assets." }); store.close();
  store = openStore(filename);
  try { expect(store.project(created.id).reviews.find((r) => r.control === "C2").evidence).toContain("no remote assets"); expect(store.list()).toHaveLength(1); expect(store.project(created.id).execution).toBe("NOT_CONNECTED"); } finally { store.close(); }
});
test("retries are idempotent and cannot overwrite a different brief", () => {
  const store = openStore(":memory:");
  try { const first = store.create(payload, "same-key"); expect(store.create(payload, "same-key").project.id).toBe(first.project.id); expect(() => store.create({ ...payload, title: "Different" }, "same-key")).toThrow("different brief"); expect(store.list()).toHaveLength(1); expect(store.events(first.project.id)).toHaveLength(1); } finally { store.close(); }
});
test("invalid inputs and evidence-free review passes are rejected", () => {
  const store = openStore(":memory:");
  try {
    expect(() => store.create({ ...payload, outcome: "invented" }, "bad")).toThrow(); expect(() => store.create({ ...payload, secret: "not-allowed" }, "bad")).toThrow();
    const p = store.create(payload, "valid").project;
    expect(() => store.review(p.id, "C1", { status: "pass", evidence: " " })).toThrow();
    expect(() => store.review(p.id, "C1", { status: "not-applicable", evidence: "" })).toThrow();
    expect(store.project(p.id).reviewComplete).toBe(false);
    for (const c of controls) store.review(p.id, c.id, { status: "not-applicable", evidence: "Documented fixture has no applicable surface." });
    expect(store.project(p.id).reviewComplete).toBe(true);
    store.review(p.id, "C4", { status: "blocked", evidence: "Sender identity remains unresolved." });
    expect(store.project(p.id).reviewComplete).toBe(false); expect(store.project(p.id).delivery).toBe("NOT_RUN");
  } finally { store.close(); }
});
test("HTTP flow persists a brief, blocks cross-origin writes and refuses unconnected execution", async () => {
  const app = startServer({ port: 0, database: file() }); const base = app.server.url.origin;
  try {
    const workspace = await (await fetch(`${base}/api/workspace`)).json(); expect(workspace.outcomes).toHaveLength(5); expect(workspace.controls).toHaveLength(6);
    const headers = { "Content-Type": "application/json", "Idempotency-Key": "http-key" };
    const forbidden = await fetch(`${base}/api/projects`, { method: "POST", headers: { ...headers, Origin: "https://untrusted.example" }, body: JSON.stringify(payload) }); expect(forbidden.status).toBe(403);
    const created = await fetch(`${base}/api/projects`, { method: "POST", headers, body: JSON.stringify(payload) }); expect(created.status).toBe(201); const { project } = await created.json();
    const replay = await fetch(`${base}/api/projects`, { method: "POST", headers, body: JSON.stringify(payload) }); expect(replay.status).toBe(200);
    const result = await fetch(`${base}/api/projects/${project.id}/execute`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); expect(result.status).toBe(503); expect((await result.json()).code).toBe("NOT_CONNECTED");
    const missing = await fetch(`${base}/api/projects`, { method: "POST", headers, body: "invalid-json" }); expect(missing.status).toBe(400);
    const html = await fetch(base); expect(html.headers.get("content-security-policy")).toContain("frame-ancestors 'none'"); expect(await html.text()).toContain("What will you");
    expect(app.store.list()).toHaveLength(1);
  } finally { await app.stop(); }
});
