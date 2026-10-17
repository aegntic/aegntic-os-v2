import { openStore } from "./store.js";
import { createExecution } from "./execution.js";
import { assertModule, moduleInfo, assertExecutionOwner, connectionInfo } from "./contracts.js";

const planned = Object.freeze([
  { id: "convex", kind: "shared-data", status: "NOT_CONNECTED", detail: "Shared application service not configured; this workspace is local." },
  { id: "cloudroom", kind: "coding-workers", status: "NOT_CONNECTED", detail: "No remote sessions or model requests." },
  { id: "creative-publishing", kind: "creative-publishing", status: "NOT_CONNECTED", detail: "Adapters not implemented. Nothing will be published." },
  { id: "rust-memory", kind: "memory", status: "NOT_CONNECTED", detail: "Candidate not installed. GBrain is excluded." },
]);
export function createRuntime({ database, pi = null, recordsFactory = openStore, executionFactory = createExecution } = {}) {
  if (pi) assertModule(pi, "pi-client");
  if (typeof recordsFactory !== "function" || typeof executionFactory !== "function") throw new TypeError("Runtime module factories must be functions.");
  const store = recordsFactory(database);
  try {
    assertModule(store, "records");
    const executor = assertModule(executionFactory(store, pi), "execution");
    const descriptor = Object.freeze(moduleInfo(executor));
    const guard = (run) => assertExecutionOwner(run, descriptor.runOwner);
    // The host enforces ownership/approval even when the execution implementation changes.
    const execution = {
      module: descriptor,
      async connection() { return connectionInfo(await executor.connection()); },
      async dispatch(projectId, input) {
        store.checkApproval(projectId, input?.revision);
        const previous = store.latestRun(projectId);
        if (previous && (previous.creativeRevision === input.revision || !["DONE", "FAILED", "ABORTED"].includes(previous.state))) guard(previous);
        return executor.dispatch(projectId, input);
      },
      async refresh(projectId) { guard(store.latestRun(projectId)); return executor.refresh(projectId); },
      async abort(projectId, runId) { guard(store.latestRun(projectId)); return executor.abort(projectId, runId); },
    };
    return {
      store, execution,
      async describe() {
        const connection = await execution.connection();
        return { contractVersion: 1, modules: [
          { ...moduleInfo(store), status: "AVAILABLE" },
          { ...moduleInfo(execution), status: connection.status },
          ...planned.map(({ id, kind, status }) => ({ id, kind, status })),
        ] };
      },
      async capabilities() {
        const connection = await execution.connection();
        return [
          { name: "Briefs and pre-launch review", status: "AVAILABLE", detail: "Local persistent records; review evidence is operator supplied." },
          { name: execution.module.id === "pi-durable" ? "Pi Durable" : execution.module.id, status: connection.status, detail: connection.status === "CONNECTED" ? `${connection.deviceName} · ${connection.model.name}. Approved briefs can run on this machine.` : connection.detail },
          ...planned.map(({ id, status, detail }) => ({ name: { convex: "Convex", cloudroom: "Cloudroom / coding workers", "creative-publishing": "Google / creative / publishing", "rust-memory": "Rust memory service" }[id], status, detail })),
        ];
      },
    };
  } catch (error) {
    if (typeof store?.close === "function") store.close();
    throw error;
  }
}
