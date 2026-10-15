import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openStore, outcomes, controls, InputError } from "./store.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export function startServer({ port = 4317, database = resolve(root, ".data/workspace.db") } = {}) {
  const store = openStore(database);
  const headers = {
    "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Cache-Control": "no-store",
  };
  const json = (data, status = 200) => Response.json(data, { status, headers });
  const capabilities = [
    { name: "Briefs and pre-launch review", status: "AVAILABLE", detail: "Local persistent records; review evidence is operator supplied." },
    { name: "Pi Durable", status: "NOT_CONNECTED", detail: "Execution authority reserved for Pi; no agent has been dispatched." },
    { name: "Convex", status: "NOT_CONNECTED", detail: "Shared application service not configured; this first-run workspace is local." },
    { name: "Cloudroom / coding workers", status: "NOT_CONNECTED", detail: "No remote sessions or model requests." },
    { name: "Google / creative / publishing", status: "NOT_CONNECTED", detail: "Adapters not implemented. Nothing will be published." },
    { name: "Rust memory service", status: "NOT_CONNECTED", detail: "Candidate not installed. GBrain is excluded." },
  ];
  const server = Bun.serve({
    hostname: "127.0.0.1", port, maxRequestBodySize: 24000,
    async fetch(req) {
      try {
        const url = new URL(req.url);
        const allowedOrigin = server.url.origin;
        if (url.origin !== allowedOrigin || (req.headers.get("origin") && req.headers.get("origin") !== allowedOrigin)) return json({ error: "This workspace accepts same-origin local requests only." }, 403);
        const assets = { "/": ["index.html", "text/html; charset=utf-8"], "/app.js": ["app.js", "text/javascript; charset=utf-8"], "/styles.css": ["styles.css", "text/css; charset=utf-8"] };
        if (req.method === "GET" && assets[url.pathname]) {
          const [name, type] = assets[url.pathname];
          return new Response(Bun.file(resolve(root, "public", name)), { headers: { ...headers, "Content-Type": type } });
        }
        if (req.method === "GET" && url.pathname === "/api/workspace") return json({ outcomes, controls, capabilities, projects: store.list(), version: "0.1.0", mode: "LOCAL_FIRST_RUN" });
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
        const review = /^\/api\/projects\/([a-f0-9-]{36})\/reviews\/(C[1-6])$/.exec(url.pathname);
        if (req.method === "PUT" && review) return json({ project: store.review(review[1], review[2], await body()) });
        const events = /^\/api\/projects\/([a-f0-9-]{36})\/events$/.exec(url.pathname);
        if (req.method === "GET" && events) return json({ events: store.events(events[1]) });
        const execute = /^\/api\/projects\/([a-f0-9-]{36})\/execute$/.exec(url.pathname);
        if (req.method === "POST" && execute) { store.project(execute[1]); return json({ error: "Pi Durable is not connected. Brief saved; no execution started.", code: "NOT_CONNECTED" }, 503); }
        return json({ error: "Not found." }, 404);
      } catch (error) {
        if (error instanceof InputError) return json({ error: error.message }, error.status);
        console.error("Workspace request failed:", error instanceof Error ? error.name : "UnknownError");
        return json({ error: "Workspace request failed; no completion has been recorded." }, 500);
      }
    },
  });
  return { server, store, async stop() { await server.stop(true); store.close(); } };
}
if (import.meta.main) {
  process.umask(0o077);
  const app = startServer();
  console.log(`Aegntic OS V2 local workspace: ${app.server.url}`);
  const stop = async () => { await app.stop(); process.exit(0); };
  process.once("SIGINT", stop); process.once("SIGTERM", stop);
}
