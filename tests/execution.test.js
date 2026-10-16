import { test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { openStore } from "../src/store.js";
import { createPiClient } from "../src/pi-client.js";
import { createExecution } from "../src/execution.js";
const cleanup = [];
afterEach(async () => { for (const dispose of cleanup.splice(0).reverse()) await dispose(); });
function directory() { const dir = mkdtempSync(join(tmpdir(), "aegntic-execution-")); cleanup.push(() => rmSync(dir, { recursive: true, force: true })); return dir; }
function approved(store) {
  const p = store.create({ title: "Execution contract fixture", outcome: "product-foundry", objective: "Exercise the adapter contract only." }, randomUUID()).project;
  store.saveCreative(p.id, { revision: 0, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com/build", graphics: "TEST FIXTURE", video: "TEST FIXTURE", duration: 45 });
  store.approveCreative(p.id, { revision: 1, confirmed: true }); return store.project(p.id);
}
function fixture({ store, fetchTransform, delayAdmission = false } = {}) {
  let uid = randomUUID(); const sessions = []; const admissions = new Map(); const calls = []; let state = "pending";
  const token = "test-device-credential-" + randomUUID();
  const server = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(req) {
    expect(req.headers.get("authorization")).toBe(`Bearer ${token}`);
    const path = new URL(req.url).pathname; calls.push(`${req.method} ${path}`);
    if (path === "/v1/device") return Response.json({ uid, name: "Contract double", apiVersion: 1, aegnticRecovery: 1, durableVersion: "1.0.3", defaultModel: "fixture-model", models: [{ id: "fixture-model", provider: "contract-double", name: "Explicit test fixture" }] });
    if (path === "/v1/sessions" && req.method === "GET") return Response.json(sessions);
    if (path === "/v1/sessions" && req.method === "POST") { const body = await req.json(); const session = { id: randomUUID(), ...body }; sessions.push(session); return Response.json(session, { status: 201 }); }
    if (path.includes("/submissions/by-request/")) return Response.json({ submissionId: admissions.get(decodeURIComponent(path.split("/").pop()))?.submissionId ?? null });
    if (path.endsWith("/config")) return Response.json({ ok: true });
    if (path.endsWith("/messages")) { const body = await req.json(); if (!delayAdmission && !admissions.has(body.requestId)) admissions.set(body.requestId, { submissionId: admissions.size + 10 }); return Response.json({ ...admissions.get(body.requestId), status: "queued" }, { status: 202 }); }
    if (path.endsWith("/abort") || req.method === "DELETE") { state = "unanswered"; return Response.json({ ok: true }); }
    if (/\/submissions\/\d+$/.test(path)) return Response.json({ submissionId: 10, status: state, ...(state === "done" ? { answer: { text: "Fixture completion", entryId: 20 } } : {}), ...(state === "unanswered" ? { reason: "aborted" } : {}) });
    return Response.json({ error: {} }, { status: 404 });
  } }); cleanup.push(() => server.stop(true));
  const rawFetch = async (...args) => { const response = await fetch(...args); return fetchTransform ? fetchTransform(args, response) : response; };
  const pi = createPiClient({ url: server.url.origin, token, workspaceRoot: directory(), fetchImpl: rawFetch });
  return { pi, execution: store ? createExecution(store, pi) : null, sessions, admissions, calls, setState(value) { state = value; }, changeDevice() { uid = randomUUID(); } };
}
test("unapproved and stale creative revisions cannot reserve or dispatch", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const f = fixture({ store }); const p = approved(store);
  await expect(f.execution.dispatch(p.id, { revision: 0 })).rejects.toThrow("approve"); expect(f.calls).toHaveLength(0);
  store.saveCreative(p.id, { revision: 1, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com/build", graphics: "changed", video: "changed", duration: 45 });
  await expect(f.execution.dispatch(p.id, { revision: 2 })).rejects.toThrow("approve"); expect(store.latestRun(p.id)).toBe(null);
});
test("concurrent retries admit one session and one message, and completion persists", async () => {
  const file = join(directory(), "workspace.db"); let store = openStore(file); const p = approved(store); const f = fixture({ store });
  try {
    const runs = await Promise.all(Array.from({ length: 5 }, () => f.execution.dispatch(p.id, { revision: 1 })));
    expect(new Set(runs.map((r) => r.id)).size).toBe(1); expect(f.sessions).toHaveLength(1); expect(f.admissions.size).toBe(1);
    expect(f.calls.filter((c) => c.endsWith("/messages"))).toHaveLength(1);
    expect((await f.execution.refresh(p.id)).state).toBe("RUNNING"); f.setState("done"); expect((await f.execution.refresh(p.id)).state).toBe("DONE");
    store.close(); store = openStore(file); expect(store.latestRun(p.id).result).toBe("Fixture completion");
  } finally { store.close(); }
});
test("lost session creation response recovers by remote identity without creating twice", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); let lost = false;
  const f = fixture({ store, fetchTransform: ([, options], response) => { if (!lost && options.method === "POST" && response.status === 201) { lost = true; throw Error("response lost"); } return response; } });
  await expect(f.execution.dispatch(p.id, { revision: 1 })).rejects.toThrow("reached");
  expect(store.latestRun(p.id).state).toBe("RECONNECT_REQUIRED");
  const run = await f.execution.dispatch(p.id, { revision: 1 }); expect(run.state).toBe("QUEUED"); expect(f.sessions).toHaveLength(1); expect(f.admissions.size).toBe(1);
});
test("accepted message with lost response survives app restart and retry uses same request ID", async () => {
  const file = join(directory(), "workspace.db"); let store = openStore(file); const p = approved(store); let lost = false;
  const f = fixture({ fetchTransform: ([url, options], response) => { if (!lost && options.method === "POST" && url.endsWith("/messages")) { lost = true; throw Error("lost accepted reply"); } return response; } });
  try {
    await expect(createExecution(store, f.pi).dispatch(p.id, { revision: 1 })).rejects.toThrow();
    const runId = store.latestRun(p.id).id; store.close(); store = openStore(file);
    const retry = await createExecution(store, f.pi).dispatch(p.id, { revision: 1 }); expect(retry.id).toBe(runId); expect(f.sessions).toHaveLength(1); expect(f.admissions.size).toBe(1);
  } finally { store.close(); }
});
test("revoked approval during session preparation prevents the model submission", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store);
  const f = fixture({ store, fetchTransform: ([url], response) => {
    if (url.endsWith("/config")) store.saveCreative(p.id, { revision: 1, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com/build", graphics: "revoked", video: "revoked", duration: 45 });
    return response;
  } });
  await expect(f.execution.dispatch(p.id, { revision: 1 })).rejects.toThrow("approve"); expect(f.admissions.size).toBe(0);
});
test("device replacement cannot receive an existing run's traffic", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); const f = fixture({ store });
  await f.execution.dispatch(p.id, { revision: 1 }); f.changeDevice();
  await expect(f.execution.refresh(p.id)).rejects.toThrow("device has changed");
  await expect(f.execution.abort(p.id, store.latestRun(p.id).id)).rejects.toThrow("device has changed"); expect(f.calls.some((c) => c.endsWith("/abort"))).toBe(false);
});
test("stop withdraws the precise submission and records only a confirmed terminal state", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); const f = fixture({ store });
  await f.execution.dispatch(p.id, { revision: 1 }); const run = await f.execution.abort(p.id, store.latestRun(p.id).id);
  expect(run.state).toBe("ABORTED"); expect(f.calls.some((c) => c.startsWith("DELETE ") && c.endsWith("/inbox/10"))).toBe(true);
});
test("new revisions cannot start while an earlier run is active", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); const f = fixture({ store });
  await f.execution.dispatch(p.id, { revision: 1 });
  store.saveCreative(p.id, { revision: 1, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com/build", graphics: "new", video: "new", duration: 45 }); store.approveCreative(p.id, { revision: 2, confirmed: true });
  await expect(f.execution.dispatch(p.id, { revision: 2 })).rejects.toThrow("earlier project run"); expect(f.admissions.size).toBe(1);
});
test("abandoned preparation is resumable and invalid device URLs fail closed", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); const f = fixture({ store });
  const d = await f.pi.device(); store.reserveRun(p.id, 1, d.uid, d.models[0], (id, rev) => f.pi.workspace(id, rev));
  expect((await f.execution.refresh(p.id)).state).toBe("RECONNECT_REQUIRED"); expect((await f.execution.dispatch(p.id, { revision: 1 })).state).toBe("QUEUED");
  expect(() => createPiClient({ url: "http://external.example", token: "a".repeat(40), workspaceRoot: "/tmp" })).toThrow("loopback");
});
test("accepted work is recoverable and stoppable after approval is revoked", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); let lost = false;
  const f = fixture({ store, fetchTransform: ([url, options], response) => { if (!lost && options.method === "POST" && url.endsWith("/messages")) { lost = true; throw Error("lost accepted reply"); } return response; } });
  await expect(f.execution.dispatch(p.id, { revision: 1 })).rejects.toThrow(); const runId = store.latestRun(p.id).id;
  store.saveCreative(p.id, { revision: 1, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com/build", graphics: "revoked", video: "revoked", duration: 45 });
  expect((await f.execution.refresh(p.id)).state).toBe("RUNNING"); expect(f.admissions.size).toBe(1);
  expect((await f.execution.abort(p.id, runId)).state).toBe("ABORTED"); expect(f.calls.filter((c) => c.endsWith("/messages"))).toHaveLength(1);
});
test("a stale stop cannot abort a newer run", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); const f = fixture({ store });
  const first = await f.execution.dispatch(p.id, { revision: 1 }); f.setState("done"); await f.execution.refresh(p.id);
  store.saveCreative(p.id, { revision: 1, aesthetic: "chrome", cta: "watch-build-live", destination: "https://example.com/build", graphics: "new", video: "new", duration: 45 }); store.approveCreative(p.id, { revision: 2, confirmed: true });
  const second = await f.execution.dispatch(p.id, { revision: 2 });
  await expect(f.execution.abort(p.id, first.id)).rejects.toThrow("displayed run has changed"); expect(store.run(second.id).state).toBe("QUEUED"); expect(f.calls.some((c) => c.endsWith("/abort"))).toBe(false);
});
test("uncertain stop remains unresolved until delayed admission is recovered and cancelled", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); let lost = false;
  const f = fixture({ store, delayAdmission: true, fetchTransform: ([url, options], response) => { if (!lost && options.method === "POST" && url.endsWith("/messages")) { lost = true; throw Error("timeout before admission"); } return response; } });
  await expect(f.execution.dispatch(p.id, { revision: 1 })).rejects.toThrow(); const run = store.latestRun(p.id);
  expect(run.sendAttempted).toBe(true); expect((await f.execution.abort(p.id, run.id)).state).toBe("STOP_UNCONFIRMED");
  f.admissions.set(run.id, { submissionId: 10 });
  expect((await f.execution.refresh(p.id)).state).toBe("ABORTED"); expect(f.calls.filter((c) => c.endsWith("/messages"))).toHaveLength(1);
});
test("stop intent survives failed withdrawal after recovering a late admission", async () => {
  const store = openStore(":memory:"); cleanup.push(() => store.close()); const p = approved(store); let lost = false; let withdrawalFailed = false;
  const f = fixture({ store, delayAdmission: true, fetchTransform: ([url, options], response) => {
    if (!lost && options.method === "POST" && url.endsWith("/messages")) { lost = true; throw Error("timeout before admission"); }
    if (!withdrawalFailed && options.method === "DELETE") { withdrawalFailed = true; throw Error("withdrawal response lost"); }
    return response;
  } });
  await expect(f.execution.dispatch(p.id, { revision: 1 })).rejects.toThrow(); const run = store.latestRun(p.id);
  expect((await f.execution.abort(p.id, run.id)).state).toBe("STOP_UNCONFIRMED"); f.admissions.set(run.id, { submissionId: 10 });
  await expect(f.execution.refresh(p.id)).rejects.toThrow(); expect(store.run(run.id).state).toBe("STOP_UNCONFIRMED");
  expect((await f.execution.refresh(p.id)).state).toBe("ABORTED"); expect(f.calls.filter((c) => c.startsWith("DELETE "))).toHaveLength(2);
});
