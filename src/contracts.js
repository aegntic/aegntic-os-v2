import { ExecutionError } from "./errors.js";

// Application-owned ports. Contract versions describe semantics, not package versions.
const methods = Object.freeze({
  records: ["create", "project", "list", "saveCreative", "approveCreative", "review", "checkApproval", "run", "latestRun", "reserveRun", "updateRun", "events", "close"],
  execution: ["connection", "dispatch", "refresh", "abort"],
  "pi-client": ["connection", "device", "workspace", "findSession", "lookupSubmission", "createSession", "configure", "send", "submission", "withdraw", "abort"],
});
export function assertModule(value, kind) {
  const descriptor = value?.module;
  if (!Object.hasOwn(methods, kind) || descriptor?.kind !== kind || descriptor.contractVersion !== 1 || typeof descriptor.id !== "string" || !/^[a-z][a-z0-9-]{0,63}$/.test(descriptor.id)) {
    throw new TypeError(`Unsupported ${kind} module contract; expected version 1.`);
  }
  if (kind === "execution") assertRunOwner(descriptor.runOwner);
  for (const name of methods[kind]) if (typeof value[name] !== "function") throw new TypeError(`${kind} module contract requires ${name}().`);
  return value;
}
export function moduleInfo(value) {
  // Deliberately allowlist public identity; never serialize the adapter/config object.
  const { id, kind, contractVersion } = value.module;
  return { id, kind, contractVersion, ...(kind === "execution" ? { runOwner: value.module.runOwner } : {}) };
}
export function assertRunOwner(owner) {
  if (typeof owner !== "string" || !/^[a-z][a-z0-9-]{0,63}\/v[1-9][0-9]{0,3}$/.test(owner)) throw new TypeError("Invalid execution owner identity.");
  return owner;
}

export function assertExecutionOwner(run, owner) {
  if (run && run.executionOwner !== owner) throw new ExecutionError("This run belongs to a different execution module. Restore its owner or reconcile it before continuing.", "EXECUTION_OWNER_MISMATCH", 409);
}
export function connectionInfo(value) {
  if (!value || typeof value.status !== "string" || !/^[A-Z][A-Z0-9_]{0,63}$/.test(value.status) || typeof value.detail !== "string") throw new TypeError("Execution connection does not match contract v1.");
  if (value.status !== "CONNECTED") return { status: value.status, detail: value.detail };
  if (![value.uid, value.deviceName, value.model?.id, value.model?.provider, value.model?.name].every((item) => typeof item === "string" && item.length > 0)) throw new TypeError("Connected execution requires device and model identity.");
  return { status: value.status, detail: value.detail, uid: value.uid, deviceName: value.deviceName, model: { id: value.model.id, provider: value.model.provider, name: value.model.name } };
}
