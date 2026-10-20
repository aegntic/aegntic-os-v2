import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const checkout = process.env.AEGNTIC_PI_CHECKOUT && resolve(root, process.env.AEGNTIC_PI_CHECKOUT);
if (!checkout) throw new Error("Set AEGNTIC_PI_CHECKOUT in .env to the qualified Durable Pi checkout.");
const backend = resolve(checkout, "apps/dpi-backend");
const runtime = resolve(root, ".data/pi-runtime.env");
const node = Bun.which("node");
if (!node || !existsSync(runtime) || !existsSync(resolve(backend, "node_modules/tsx/dist/cli.mjs"))) throw new Error("Node, the private runtime config and upstream npm dependencies are required. See EXECUTION.md.");
const core = JSON.parse(readFileSync(resolve(root, "integrations/pi-durable/core.json"), "utf8"));
const revision = await new Response(Bun.spawn(["git", "rev-parse", "HEAD"], { cwd: checkout, stdout: "pipe" }).stdout).text();
if (revision.trim() !== core.revision) throw new Error("Pi checkout does not match the qualified revision.");
const upgrade = Bun.spawn(["git", "apply", "--reverse", "--check", resolve(root, "integrations/pi-durable/core-1.1.0.patch")], { cwd: checkout, stdout: "ignore", stderr: "ignore" });
if (await upgrade.exited !== 0) throw new Error("Apply the pinned 1.1.0 core upgrade before launching.");
const lock = await Bun.file(resolve(backend, "package-lock.json")).arrayBuffer();
if (new Bun.CryptoHasher("sha256").update(lock).digest("hex") !== core.lockSha256) throw new Error("Pi npm lockfile differs from the qualified core.");
for (const name of core.packages) {
  const installed = JSON.parse(readFileSync(resolve(backend, "node_modules", name, "package.json"), "utf8"));
  if (installed.version !== core.durableVersion) throw new Error("Run npm ci for the pinned Pi core before launching.");
}
const check = Bun.spawn(["git", "apply", "--reverse", "--check", resolve(root, "integrations/pi-durable/provider-support.patch")], { cwd: checkout, stdout: "ignore", stderr: "ignore" });
if (await check.exited !== 0) throw new Error("Apply the qualified provider/recovery patch before launching.");
const device = Bun.spawn([node, `--env-file=${runtime}`, "node_modules/tsx/dist/cli.mjs", "src/main.ts"], { cwd: backend, stdin: "ignore", stdout: "inherit", stderr: "inherit" });
const app = Bun.spawn([process.execPath, "src/server.js"], { cwd: root, stdin: "ignore", stdout: "inherit", stderr: "inherit" });
let closing = false;
async function stop(code = 0) {
  if (closing) return; closing = true; device.kill("SIGTERM"); app.kill("SIGTERM");
  await Promise.all([device.exited, app.exited]); process.exit(code);
}
process.on("SIGINT", () => stop()); process.on("SIGTERM", () => stop());
const first = await Promise.race([device.exited, app.exited]);
await stop(first || 1);
