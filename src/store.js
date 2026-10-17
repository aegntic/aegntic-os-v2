import { Database } from "bun:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";

import { outcomes, controls, aesthetics, callsToAction } from "./catalogue.js";
import { InputError } from "./errors.js";
import { assertRunOwner } from "./contracts.js";
export { outcomes, controls, aesthetics } from "./catalogue.js";
export { InputError } from "./errors.js";

function text(value, field, max) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new InputError(`${field} must contain 1–${max} characters.`);
  return value.trim();
}
function exactKeys(input, allowed) {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some((key) => !allowed.includes(key))) throw new InputError("Unsupported input fields.");
}
export function openStore(filename) {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const db = new Database(filename, { create: true, strict: true });
  if (filename !== ":memory:") chmodSync(filename, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, title TEXT NOT NULL, outcome TEXT NOT NULL, objective TEXT NOT NULL, created_at TEXT NOT NULL, request_key TEXT NOT NULL UNIQUE, payload_hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS reviews (project_id TEXT NOT NULL REFERENCES projects(id), control TEXT NOT NULL, status TEXT NOT NULL, evidence TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(project_id, control));
    CREATE TABLE IF NOT EXISTS creative (project_id TEXT PRIMARY KEY REFERENCES projects(id), revision INTEGER NOT NULL, payload TEXT NOT NULL, approved_at TEXT);
    CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),creative_revision INTEGER NOT NULL,device_uid TEXT NOT NULL,model TEXT NOT NULL,cwd TEXT NOT NULL,prompt TEXT NOT NULL,session_id TEXT,submission_id INTEGER,state TEXT NOT NULL,result TEXT NOT NULL DEFAULT '',error TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(project_id,creative_revision));
    CREATE TABLE IF NOT EXISTS events (sequence INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL REFERENCES projects(id), kind TEXT NOT NULL, created_at TEXT NOT NULL);
  `);
  if (!db.query("PRAGMA table_info(runs)").all().some((column) => column.name === "send_attempted")) db.exec("ALTER TABLE runs ADD COLUMN send_attempted INTEGER NOT NULL DEFAULT 0");
  // Existing releases only wrote Pi runs. Add identity without rewriting those runs.
  if (!db.query("PRAGMA table_info(runs)").all().some((column) => column.name === "execution_owner")) db.exec("ALTER TABLE runs ADD COLUMN execution_owner TEXT NOT NULL DEFAULT 'pi-durable/v1'");
  function project(id) {
    const record = db.query("SELECT id,title,outcome,objective,created_at FROM projects WHERE id=?").get(id);
    if (!record) throw new InputError("Project not found.", 404);
    const reviews = db.query("SELECT control,status,evidence,updated_at FROM reviews WHERE project_id=? ORDER BY control").all(id);
    const creativeRecord = db.query("SELECT revision,payload,approved_at FROM creative WHERE project_id=?").get(id);
    const creative = creativeRecord ? { ...JSON.parse(creativeRecord.payload), revision: creativeRecord.revision, approvedAt: creativeRecord.approved_at } : { revision: 0, aesthetic: "", cta: "join-waitlist", destination: "", graphics: "", video: "", duration: 45, approvedAt: null };
    const latest = latestRun(id);
    return { ...record, run: latest, creative, creativeReady: Boolean(creative.approvedAt), reviews, reviewComplete: reviews.length === controls.length && reviews.every((r) => ["pass", "not-applicable"].includes(r.status)), execution: latest?.state || "NOT_STARTED", delivery: "NOT_RUN" };
  }
  function run(id) {
    const record = db.query("SELECT * FROM runs WHERE id=?").get(id);
    if (!record) throw new InputError("Run not found.", 404);
    return { executionOwner: record.execution_owner, id: record.id, projectId: record.project_id, creativeRevision: record.creative_revision, deviceUid: record.device_uid, model: JSON.parse(record.model), cwd: record.cwd, prompt: record.prompt, sessionId: record.session_id, submissionId: record.submission_id, sendAttempted: Boolean(record.send_attempted), state: record.state, result: record.result, error: record.error, createdAt: record.created_at, updatedAt: record.updated_at };
  }
  function latestRun(projectId) { const record = db.query("SELECT id FROM runs WHERE project_id=? ORDER BY rowid DESC LIMIT 1").get(projectId); return record ? run(record.id) : null; }
  function checkApproval(id, revision) {
    const p = project(id);
    if (!p.creativeReady || p.creative.revision !== revision) throw new InputError("Choose and approve the current creative package before building.", 409);
    return p;
  }
  return {
    module: Object.freeze({ id: "sqlite-local", kind: "records", contractVersion: 1 }),
    create(input, requestKey) {
      exactKeys(input, ["title", "outcome", "objective"]);
      const payload = { title: text(input.title, "Title", 120), outcome: input.outcome, objective: text(input.objective, "Objective", 6000) };
      if (!outcomes.some((o) => o.id === payload.outcome)) throw new InputError("Choose a supported outcome.");
      const key = text(requestKey, "Request key", 128);
      const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
      return db.transaction(() => {
        const existing = db.query("SELECT id,payload_hash FROM projects WHERE request_key=?").get(key);
        if (existing) {
          if (existing.payload_hash !== hash) throw new InputError("Request key already belongs to a different brief.", 409);
          return { project: project(existing.id), replayed: true };
        }
        const id = randomUUID(); const at = new Date().toISOString();
        db.query("INSERT INTO projects VALUES (?,?,?,?,?,?,?)").run(id, payload.title, payload.outcome, payload.objective, at, key, hash);
        for (const control of controls) db.query("INSERT INTO reviews VALUES (?,?,?,?,?)").run(id, control.id, "not-reviewed", "", at);
        db.query("INSERT INTO events(project_id,kind,created_at) VALUES (?,?,?)").run(id, "brief.saved", at);
        return { project: project(id), replayed: false };
      })();
    },
    list() { return db.query("SELECT id FROM projects ORDER BY created_at DESC, rowid DESC").all().map((r) => project(r.id)); },
    project,
    review(id, control, input) {
      exactKeys(input, ["status", "evidence"]);
      if (!controls.some((c) => c.id === control)) throw new InputError("Unknown control.");
      if (!["not-reviewed", "pass", "not-applicable", "blocked"].includes(input.status)) throw new InputError("Unknown review status.");
      const evidence = input.status === "not-reviewed" ? "" : text(input.evidence, "Evidence or applicability reason", 4000);
      return db.transaction(() => {
        project(id);
        const at = new Date().toISOString();
        db.query("UPDATE reviews SET status=?,evidence=?,updated_at=? WHERE project_id=? AND control=?").run(input.status, evidence, at, id, control);
        db.query("INSERT INTO events(project_id,kind,created_at) VALUES (?,?,?)").run(id, `review.${control}.${input.status}`, at);
        return project(id);
      })();
    },
    saveCreative(id, input) {
      exactKeys(input, ["revision", "aesthetic", "cta", "destination", "graphics", "video", "duration"]);
      if (!aesthetics.some((a) => a.id === input.aesthetic)) throw new InputError("Choose one of the aesthetic examples.");
      if (!callsToAction.includes(input.cta)) throw new InputError("Choose a supported call to action.");
      if (!Number.isInteger(input.duration) || input.duration < 30 || input.duration > 60) throw new InputError("Teaser duration must be 30–60 seconds.");
      const payload = { aesthetic: input.aesthetic, cta: input.cta, duration: input.duration };
      for (const key of ["destination", "graphics", "video"]) {
        if (typeof input[key] !== "string" || input[key].length > 4000) throw new InputError("Asset references must be text, at most 4000 characters.");
        payload[key] = input[key].trim();
      }
      if (payload.destination) {
        try { const url = new URL(payload.destination); if (url.protocol !== "https:" || url.username || url.password) throw new Error(); }
        catch { throw new InputError("Call-to-action destination must be an HTTPS URL without credentials."); }
      }
      return db.transaction(() => {
        const current = project(id).creative;
        if (input.revision !== current.revision) throw new InputError("Creative brief changed. Reopen it before saving.", 409);
        db.query("INSERT INTO creative VALUES (?,?,?,NULL) ON CONFLICT(project_id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload,approved_at=NULL").run(id, current.revision + 1, JSON.stringify(payload));
        db.query("INSERT INTO events(project_id,kind,created_at) VALUES (?,?,?)").run(id, "creative.draft.saved", new Date().toISOString());
        return project(id);
      })();
    },
    approveCreative(id, input) {
      exactKeys(input, ["revision", "confirmed"]);
      return db.transaction(() => {
        const current = project(id).creative;
        if (input.revision !== current.revision) throw new InputError("Creative brief changed. Reopen it before approving.", 409);
        if (input.confirmed !== true || !current.aesthetic || !current.destination || !current.graphics || !current.video) throw new InputError("Review the aesthetic, final social graphics, final 30–60 second teaser and destination before approving.");
        db.query("UPDATE creative SET approved_at=? WHERE project_id=?").run(new Date().toISOString(), id);
        db.query("INSERT INTO events(project_id,kind,created_at) VALUES (?,?,?)").run(id, "creative.approved", new Date().toISOString());
        return project(id);
      })();
    },
    checkApproval,
    run,
    latestRun,
    reserveRun(id, revision, deviceUid, model, workspace, executionOwner = "pi-durable/v1") {
      assertRunOwner(executionOwner);
      return db.transaction(() => {
        const p = checkApproval(id, revision);
        const existing = db.query("SELECT id FROM runs WHERE project_id=? AND creative_revision=?").get(id, revision);
        if (existing) return run(existing.id);
        const active = db.query("SELECT id FROM runs WHERE project_id=? AND state NOT IN ('DONE','FAILED','ABORTED') LIMIT 1").get(id);
        if (active) throw new InputError("Finish or stop the earlier project run before dispatching a new revision.", 409);
        const runId = randomUUID(); const at = new Date().toISOString(); const cwd = workspace(id, revision);
        const prompt = "Implement this approved project brief in your working directory. Produce useful files and verification evidence. Do not publish or deploy.\n\n" + JSON.stringify({ title: p.title, outcome: p.outcome, objective: p.objective, creative: p.creative }, null, 2);
        db.query("INSERT INTO runs(id,project_id,creative_revision,device_uid,model,cwd,prompt,state,created_at,updated_at,execution_owner) VALUES(?,?,?,?,?,?,?, 'PREPARING',?,?,?)").run(runId, id, revision, deviceUid, JSON.stringify(model), cwd, prompt, at, at, executionOwner);
        db.query("INSERT INTO events(project_id,kind,created_at) VALUES (?,?,?)").run(id, "execution.reserved", at);
        return run(runId);
      })();
    },
    updateRun(id, input) {
      exactKeys(input, ["sessionId", "submissionId", "sendAttempted", "state", "result", "error"]);
      return db.transaction(() => {
        const current = run(id); const next = { ...current, ...input };
        db.query("UPDATE runs SET session_id=?,submission_id=?,send_attempted=?,state=?,result=?,error=?,updated_at=? WHERE id=?").run(next.sessionId, next.submissionId, Number(next.sendAttempted), next.state, next.result, next.error, new Date().toISOString(), id);
        if (next.state !== current.state) db.query("INSERT INTO events(project_id,kind,created_at) VALUES (?,?,?)").run(current.projectId, `execution.${next.state.toLowerCase()}`, new Date().toISOString());
        return run(id);
      })();
    },
    events(id) { project(id); return db.query("SELECT sequence,kind,created_at FROM events WHERE project_id=? ORDER BY sequence").all(id); },
    close() { db.close(); },
  };
}
