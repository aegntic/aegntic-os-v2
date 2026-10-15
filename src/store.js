import { Database } from "bun:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";

export const outcomes = [
  { id: "venture-lab", name: "Venture Lab", purpose: "Find the audience. Test the offer.", artifact: "Offer and evidence-gap audit" },
  { id: "product-foundry", name: "Product Foundry", purpose: "Build a working slice. Prove the behavior.", artifact: "Working slice and regression evidence" },
  { id: "experience-studio", name: "Experience Studio", purpose: "Make it distinctive. Make it usable.", artifact: "Interface or media with inspection evidence" },
  { id: "knowledge-engine", name: "Knowledge Engine", purpose: "Reach a sourced decision. Keep its lineage.", artifact: "Decision and primary-source references" },
  { id: "agent-evolution", name: "Agent Evolution", purpose: "Test an improvement against a frozen baseline.", artifact: "Evaluation and reversible promotion decision" },
];
export const controls = [
  { id: "C1", name: "Capacity", question: "Are capacity signals present at relevant account and data collection points?" },
  { id: "C2", name: "Identifier disclosure", question: "Have avoidable third-party asset and tracking requests been addressed?" },
  { id: "C3", name: "Input capture", question: "Are recording choices and sensitive-input masking verified?" },
  { id: "C4", name: "Commercial messages", question: "Are message purpose, refusal path and sender identity established where applicable?" },
  { id: "C5", name: "Recurring assent", question: "Are price and billing cadence clear beside payment controls?" },
  { id: "C6", name: "User content", question: "Are upload surfaces and applicable operator notice paths established?" },
];
export const aesthetics = [
  { id: "obsidian", name: "Obsidian Atelier", description: "Silver edges, pearl type and deep glass. Tactile depth from the supplied style guide, without Clawreform amber.", mood: "Tactile · intimate · composed" },
  { id: "chrome", name: "Chrome Architecture", description: "Cool silver, glass panels and precise blue lines. Drawn from the AEGNTIC deck.", mood: "Technical · spatial · luminous" },
  { id: "pearl", name: "Pearl Editorial", description: "Warm paper, oversized serif typography and generous quiet space.", mood: "Human · considered · editorial" },
  { id: "signal", name: "Machined Instrument", description: "Graphite, brushed surfaces and precise utilitarian typography.", mood: "Tactile · precise · industrial" },
];
export const callsToAction = ["join-waitlist", "pre-order", "watch-build-live"];
export class InputError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
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
    CREATE TABLE IF NOT EXISTS events (sequence INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL REFERENCES projects(id), kind TEXT NOT NULL, created_at TEXT NOT NULL);
  `);
  function project(id) {
    const record = db.query("SELECT id,title,outcome,objective,created_at FROM projects WHERE id=?").get(id);
    if (!record) throw new InputError("Project not found.", 404);
    const reviews = db.query("SELECT control,status,evidence,updated_at FROM reviews WHERE project_id=? ORDER BY control").all(id);
    const creativeRecord = db.query("SELECT revision,payload,approved_at FROM creative WHERE project_id=?").get(id);
    const creative = creativeRecord ? { ...JSON.parse(creativeRecord.payload), revision: creativeRecord.revision, approvedAt: creativeRecord.approved_at } : { revision: 0, aesthetic: "", cta: "join-waitlist", destination: "", graphics: "", video: "", duration: 45, approvedAt: null };
    return { ...record, creative, creativeReady: Boolean(creative.approvedAt), reviews, reviewComplete: reviews.length === controls.length && reviews.every((r) => ["pass", "not-applicable"].includes(r.status)), execution: "NOT_CONNECTED", delivery: "NOT_RUN" };
  }
  return {
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
    events(id) { project(id); return db.query("SELECT sequence,kind,created_at FROM events WHERE project_id=? ORDER BY sequence").all(id); },
    close() { db.close(); },
  };
}
