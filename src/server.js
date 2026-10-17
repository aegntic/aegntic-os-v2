import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { outcomes, controls, aesthetics } from "./catalogue.js";
import { InputError, ExecutionError } from "./errors.js";

import { createPiClient } from "./pi-client.js";
import { createRuntime } from "./runtime.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export function startServer({ port = 4317, database = resolve(root, ".data/workspace.db"), pi = null, recordsFactory, executionFactory } = {}) {
  const runtime = createRuntime({ database, pi, recordsFactory, executionFactory });
  const { store, execution } = runtime;
  const headers = {
    "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Cache-Control": "no-store",
  };
  const json = (data, status = 200) => Response.json(data, { status, headers });
  let server;
  try {
    server = Bun.serve({
    hostname: "127.0.0.1", port, maxRequestBodySize: 24000,
    async fetch(req) {
      try {
        const url = new URL(req.url);
        const allowedOrigin = server.url.origin;
        if (url.origin !== allowedOrigin || (req.headers.get("origin") && req.headers.get("origin") !== allowedOrigin)) return json({ error: "This workspace accepts same-origin local requests only." }, 403);
        const assets = { "/concepts.js": ["concepts.js", "text/javascript; charset=utf-8"], "/concepts.css": ["concepts.css", "text/css; charset=utf-8"], "/assets/hero-glass-gallery.png": ["assets/hero-glass-gallery.png", "image/png"], "/assets/hero-smoked-instrument.png": ["assets/hero-smoked-instrument.png", "image/png"], "/assets/aegntic-mark.webp": ["assets/aegntic-mark.webp", "image/webp"], "/": ["index.html", "text/html; charset=utf-8"], "/app.js": ["app.js", "text/javascript; charset=utf-8"], "/styles.css": ["styles.css", "text/css; charset=utf-8"] };
        if (req.method === "GET" && assets[url.pathname]) {
          const [name, type] = assets[url.pathname];
          return new Response(Bun.file(resolve(root, "public", name)), { headers: { ...headers, "Content-Type": type } });
        }
        if (req.method === "GET" && url.pathname === "/api/workspace") return json({ outcomes, controls, aesthetics, capabilities: await runtime.capabilities(), projects: store.list(), version: "0.1.0", mode: "LOCAL_FIRST_RUN" });
        if (req.method === "GET" && url.pathname === "/api/system") return json(await runtime.describe());
        if (req.method === "GET" && url.pathname === "/api/execution/connection") return json(await execution.connection());
        if (!["GET", "POST", "PUT"].includes(req.method)) return json({ error: "Method not allowed." }, 405);
        if (["POST", "PUT"].includes(req.method) && !req.headers.get("content-type")?.startsWith("application/json")) return json({ error: "JSON content type required." }, 415);
        async function body() {
          const value = await req.text();
          if (value.length > 20000) throw new InputError("Brief is too large.", 413);
          try { return JSON.parse(value); } catch { throw new InputError("Invalid JSON."); }
        }
        if (req.method === "POST" && url.pathname === "/api/projects") {
          const result = store.create(await body(), req.headers.get("idempotency-key"));
          return json(result, result.replayed ? 200 : 201);
        }
        const projectRead = /^\/api\/projects\/([a-f0-9-]{36})$/.exec(url.pathname);
        if (req.method === "GET" && projectRead) return json({ project: store.project(projectRead[1]) });
        const creative = /^\/api\/projects\/([a-f0-9-]{36})\/creative(\/approve)?$/.exec(url.pathname);
        if (req.method === "PUT" && creative && !creative[2]) return json({ project: store.saveCreative(creative[1], await body()) });
        if (req.method === "POST" && creative?.[2]) return json({ project: store.approveCreative(creative[1], await body()) });
        const review = /^\/api\/projects\/([a-f0-9-]{36})\/reviews\/(C[1-6])$/.exec(url.pathname);
        if (req.method === "PUT" && review) return json({ project: store.review(review[1], review[2], await body()) });
        const events = /^\/api\/projects\/([a-f0-9-]{36})\/events$/.exec(url.pathname);
        if (req.method === "GET" && events) return json({ events: store.events(events[1]) });
        const execute = /^\/api\/projects\/([a-f0-9-]{36})\/execute$/.exec(url.pathname);
        if (req.method === "POST" && execute) {
          const project = store.project(execute[1]);
          if (!project.creativeReady) return json({ error: "Choose an aesthetic and approve the social graphics, teaser and call to action before building.", code: "CREATIVE_APPROVAL_REQUIRED" }, 409);
          const input = await body();
          if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some((key) => key !== "revision") || !Number.isSafeInteger(input.revision)) throw new InputError("The displayed creative revision is required.");
          const run = await execution.dispatch(execute[1], input);
          return json({ run, project: store.project(execute[1]) }, 202);
        }
        const run = /^\/api\/projects\/([a-f0-9-]{36})\/execution(\/abort)?$/.exec(url.pathname);
        if (req.method === "GET" && run && !run[2]) { store.project(run[1]); const result = await execution.refresh(run[1]); return json({ run: result, project: store.project(run[1]) }); }
        if (req.method === "POST" && run?.[2]) { const input = await body();
          if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some((key) => key !== "runId") || typeof input.runId !== "string") throw new InputError("The displayed run ID is required.");
          const result = await execution.abort(run[1], input.runId); return json({ run: result, project: store.project(run[1]) }); }
        return json({ error: "Not found." }, 404);
      } catch (error) {
        if (error instanceof ExecutionError) return json({ error: error.message, code: error.code }, error.status);
        if (error instanceof InputError) return json({ error: error.message }, error.status);
        console.error("Workspace request failed:", error instanceof Error ? error.name : "UnknownError");
        return json({ error: "Workspace request failed; no completion has been recorded." }, 500);
      }
    },
  });
  } catch (error) {
    store.close();
    throw error;
  }
  return { server, store, async stop() { await server.stop(true); store.close(); } };
}
if (import.meta.main) {
  process.umask(0o077);
  const app = startServer({ pi: createPiClient({ url: process.env.AEGNTIC_PI_URL, token: process.env.AEGNTIC_PI_TOKEN, workspaceRoot: process.env.AEGNTIC_PI_WORKSPACE_ROOT }) });
  console.log(`Aegntic OS V2 local workspace: ${app.server.url}`);
  const stop = async () => { await app.stop(); process.exit(0); };
  process.once("SIGINT", stop); process.once("SIGTERM", stop);
}
