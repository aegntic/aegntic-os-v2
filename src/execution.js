import { ExecutionError } from "./pi-client.js";
export function createExecution(store, pi) {
  const active = new Map();
  const unavailable = () => { if (!pi) throw new ExecutionError("Pi Durable is not configured.", "NOT_CONNECTED", 503); };
  async function locked(id, task) {
    const previous = active.get(id);
    const pending = (previous ? previous.catch(() => {}) : Promise.resolve()).then(task);
    active.set(id, pending);
    try { return await pending; } finally { if (active.get(id) === pending) active.delete(id); }
  }
  async function recover(run) {
    await pi.device(run.deviceUid);
    let current = run;
    if (!current.sessionId) {
      const session = await pi.findSession(current);
      if (session) current = store.updateRun(current.id, { sessionId: session.id });
    }
    if (current.sessionId && current.submissionId === null) {
      const found = await pi.lookupSubmission(current.sessionId, current.id);
      if (found.submissionId !== null) {
        if (!Number.isSafeInteger(found.submissionId) || found.submissionId < 0) throw new ExecutionError("Invalid recovered submission identity.", "PI_INVALID_RESPONSE");
        current = store.updateRun(current.id, { submissionId: found.submissionId, state: current.state === "STOP_UNCONFIRMED" ? "STOP_UNCONFIRMED" : "QUEUED", error: current.state === "STOP_UNCONFIRMED" ? current.error : "" });
      }
    }
    return current;
  }
  async function confirmStop(current) {
    if (current.submissionId === null) return store.updateRun(current.id, current.sendAttempted
      ? { state: "STOP_UNCONFIRMED", error: "An earlier send may still be admitted. Keep this run open; refresh will recover and stop it when visible." }
      : { state: "ABORTED", error: "Dispatch cancelled before any model admission attempt.", result: "" });
    if (current.state !== "STOP_UNCONFIRMED") current = store.updateRun(current.id, { state: "STOP_UNCONFIRMED", error: "Stop requested; waiting for upstream confirmation." });
    await pi.withdraw(current.sessionId, current.submissionId);
    await pi.abort(current.sessionId);
    const result = await pi.submission(current.sessionId, current.submissionId);
    if (result.status === "done") return store.updateRun(current.id, { state: "DONE", result: result.answer?.text || "", error: "" });
    if (result.status !== "unanswered") return store.updateRun(current.id, { state: "STOP_UNCONFIRMED", error: "Pi has not confirmed the stop yet. Keep this run open or refresh it." });
    return store.updateRun(current.id, { state: "ABORTED", error: "Stopped by user.", result: "" });
  }
  return {
    connection: () => pi ? pi.connection() : Promise.resolve({ status: "NOT_CONNECTED", detail: "Configure a Pi device to run approved project briefs." }),
    async dispatch(projectId, input) {
      store.checkApproval(projectId, input?.revision); unavailable();
      const connection = await pi.connection();
      if (connection.status !== "CONNECTED") throw new ExecutionError(connection.detail, connection.status, 503);
      const run = store.reserveRun(projectId, input.revision, connection.uid, connection.model, (id, rev) => pi.workspace(id, rev));
      return locked(run.id, async () => {
        let current = store.run(run.id);
        if (current.submissionId !== null || ["DONE", "FAILED", "ABORTED", "STOP_UNCONFIRMED"].includes(current.state)) return current;
        try {
          await pi.device(current.deviceUid);
          store.checkApproval(projectId, current.creativeRevision);
          if (!current.sessionId) current = store.updateRun(current.id, { sessionId: await pi.createSession(current, current.model), state: "PREPARING", error: "" });
          await pi.configure(current.sessionId);
          store.checkApproval(projectId, current.creativeRevision);
          current = store.updateRun(current.id, { sendAttempted: true, state: "ADMITTING" });
          const result = await pi.send(current.sessionId, current);
          if (!Number.isSafeInteger(result.submissionId) || result.submissionId < 0) throw new ExecutionError("Pi did not return a submission identity. Retry uses the same request ID.", "PI_INVALID_RESPONSE");
          return store.updateRun(current.id, { submissionId: result.submissionId, state: "QUEUED", error: "" });
        } catch (e) {
          store.updateRun(current.id, { state: "RECONNECT_REQUIRED", error: e instanceof ExecutionError ? e.message : "Dispatch paused. Reopen this run before retrying." });
          throw e;
        }
      });
    },
    async refresh(projectId) {
      const run = store.latestRun(projectId); if (!run) return null;
      unavailable();
      return locked(run.id, async () => {
        let current = store.run(run.id);
        if (["DONE", "FAILED", "ABORTED"].includes(current.state)) return current;
        const stopping = current.state === "STOP_UNCONFIRMED";
        current = await recover(current);
        if (stopping) return confirmStop(current);
        if (current.submissionId === null) return store.updateRun(current.id, { state: "RECONNECT_REQUIRED", error: "A saved dispatch needs reconnection before its status can be confirmed." });
        await pi.device(current.deviceUid);
        const result = await pi.submission(current.sessionId, current.submissionId);
        if (!["queued", "pending", "done", "unanswered"].includes(result.status)) throw new ExecutionError("Unknown Pi submission state.", "PI_INVALID_RESPONSE");
        const state = { queued: "QUEUED", pending: "RUNNING", done: "DONE", unanswered: "FAILED" }[result.status];
        return store.updateRun(current.id, { state, result: typeof result.answer?.text === "string" ? result.answer.text : "", error: result.status === "unanswered" ? String(result.reason || "Agent stopped without an answer.") : "" });
      });
    },
    async abort(projectId, expectedRunId) {
      unavailable(); const run = store.latestRun(projectId); if (!run) throw new ExecutionError("No run to stop.", "RUN_NOT_FOUND", 404);
      if (run.id !== expectedRunId) throw new ExecutionError("The displayed run has changed. Reopen execution before stopping it.", "RUN_CHANGED", 409);
      return locked(run.id, async () => {
        let current = store.run(run.id);
        if (store.latestRun(projectId).id !== expectedRunId) throw new ExecutionError("The displayed run has changed. Reopen execution before stopping it.", "RUN_CHANGED", 409);
        if (["DONE", "FAILED", "ABORTED"].includes(current.state)) return current;
        current = store.updateRun(current.id, { state: "STOP_UNCONFIRMED", error: "Stop requested; waiting for upstream confirmation." });
        current = await recover(current);
        return confirmStop(current);
      });
    },
  };
}
