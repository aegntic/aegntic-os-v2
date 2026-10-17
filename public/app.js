import { concepts, renderConcept } from "./concepts.js";
let state; let selected = "product-foundry"; let activeProject; let pendingSubmission; let briefBusy = false; let reviewBusy = false;
const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
const $ = (id) => document.getElementById(id);
function notice(message) { $("notice").textContent = message; }
async function api(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}
let creativeDisplayedRevision = 0; let creativeOpenRequest = 0;
let creativeProject; let previewAesthetic = ""; let creativeBusy = false; let creativeDirty = false;
function renderAesthetics() {
  $("aesthetics").replaceChildren(...state.aesthetics.map((a, index) => {
    const button = el("button", undefined, `aesthetic ${a.id}`); button.type = "button";
    button.setAttribute("aria-pressed", String(previewAesthetic === a.id));
    button.append(el("small", concepts[a.id].layout), el("strong", a.name));
    button.onclick = () => {
      if (creativeBusy) return;
      previewAesthetic = a.id; renderAesthetics(); $("aesthetics").children[index].focus({ preventScroll: true });
      $("aesthetic-selection").textContent = `${a.name} selected as a starting point for this brief. Save the direction before approving the final launch kit.`;
      if (creativeProject) { $("creative-aesthetic").value = a.id; markCreativeDirty(); }
    };
    return button;
  }));
  renderConcept(previewAesthetic || "obsidian", $("style-preview"));
}
$("expand-preview").onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($("style-preview").requestFullscreen) await $("style-preview").requestFullscreen();
    else notice("Full-screen preview is unavailable in this browser. The complete layout is shown below.");
  } catch { notice("Full-screen preview is unavailable here. The complete layout is shown below."); }
};
async function openCreative(projectId) {
  if (creativeBusy) return;
  const request = ++creativeOpenRequest;
  try {
    const result = await api(`/api/projects/${projectId}`);
    if (request !== creativeOpenRequest || creativeBusy) return;
    state.projects = state.projects.map((p) => p.id === result.project.id ? result.project : p);
    creativeProject = projectId; renderKickoff(); $("kickoff").scrollIntoView({ block: "start" }); $("kickoff-title").focus({ preventScroll: true });
  } catch (error) { notice(error.message); }
}
function markCreativeDirty() {
  creativeDirty = true; $("creative-confirm").checked = false; $("approve-creative").disabled = true;
  $("kickoff-summary").textContent = "Unsaved changes. Save this draft, review the package, then approve it.";
}
function renderKickoff() {
  const project = state.projects.find((p) => p.id === creativeProject);
  $("kickoff").hidden = !project; if (!project) return;
  const c = project.creative; creativeDisplayedRevision = c.revision;
  $("kickoff-title").textContent = `Creative kickoff / ${project.title}`;
  $("creative-aesthetic").replaceChildren(...[{ id: "", name: "Choose an example above" }, ...state.aesthetics].map((a) => { const option = el("option", a.name); option.value = a.id; return option; }));
  $("creative-brief").textContent = project.objective;
  previewAesthetic = c.aesthetic || "";
  renderAesthetics();
  $("aesthetic-selection").textContent = c.aesthetic ? "Saved direction for this brief. Review the examples and adapt it to the outcome." : "Choose a starting point for this brief. No direction is selected.";
  $("creative-aesthetic").value = c.aesthetic;
  for (const key of ["cta", "destination", "graphics", "video", "duration"]) $(`creative-${key}`).value = c[key];
  creativeDirty = false;
  $("creative-confirm").checked = false;
  $("approve-creative").disabled = creativeDirty || creativeBusy || Boolean(c.approvedAt);
  $("kickoff-summary").textContent = c.approvedAt ? "Launch kit approved. Open agent execution when you are ready to start." : "Build held at creative kickoff. Choose a direction and review the final launch assets.";
}
function creativePayload() {
  const payload = { revision: creativeDisplayedRevision };
  for (const key of ["aesthetic", "cta", "destination", "graphics", "video"]) payload[key] = $(`creative-${key}`).value;
  payload.duration = Number($("creative-duration").value); return payload;
}
$("creative-form").addEventListener("input", markCreativeDirty);
$("creative-form").addEventListener("change", markCreativeDirty);
$("creative-aesthetic").addEventListener("change", () => {
  previewAesthetic = $("creative-aesthetic").value; renderAesthetics();
  $("aesthetic-selection").textContent = previewAesthetic ? "Direction changed for this brief. Save before approval." : "Choose a starting point for this brief. No direction is selected.";
});
async function saveCreative(approve) {
  if (creativeBusy) return;
  const project = state.projects.find((p) => p.id === creativeProject); if (!project) return;
  if (approve && (creativeDirty || !$("creative-confirm").checked)) { notice("Review the saved package and confirm it before approval."); return; }
  creativeBusy = true; ++creativeOpenRequest;
  const fields = [...$("creative-form").querySelectorAll("input,select,textarea,button"), $("approve-creative"), $("creative-confirm")];
  const payload = approve ? { revision: creativeDisplayedRevision, confirmed: true } : creativePayload();
  fields.forEach((field) => { field.disabled = true; });
  try {
    const result = await api(`/api/projects/${project.id}/creative${approve ? "/approve" : ""}`, { method: approve ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    state.projects = state.projects.map((p) => p.id === result.project.id ? result.project : p);
    renderProjects();
    if (creativeProject === project.id) renderKickoff();
    notice(approve ? "Launch kit approved. No build or publication has started." : "Creative draft saved. Review its final assets before approval.");
  } catch (error) { notice(error.message); }
  finally {
    creativeBusy = false; fields.forEach((field) => { field.disabled = false; });
    const current = state.projects.find((p) => p.id === creativeProject);
    $("approve-creative").disabled = creativeDirty || Boolean(current?.creative.approvedAt);
  }
}
$("creative-form").onsubmit = (event) => { event.preventDefault(); saveCreative(false); };
$("approve-creative").onclick = () => saveCreative(true);
$("close-kickoff").onclick = () => { if (creativeBusy) return; ++creativeOpenRequest; creativeProject = undefined; renderKickoff(); };

function renderOutcomes() {
  $("outcomes").replaceChildren(...state.outcomes.map((outcome, index) => {
    const button = el("button", undefined, "outcome"); button.type = "button";
    button.setAttribute("aria-pressed", String(outcome.id === selected));
    button.append(el("span", String(index + 1).padStart(2, "0"), "number"), el("strong", outcome.name), el("small", outcome.purpose));
    button.onclick = () => { selected = outcome.id; renderOutcomes(); };
    return button;
  }));
  $("selected").textContent = state.outcomes.find((o) => o.id === selected).name;
}
function renderProjects() {
  $("count").textContent = String(state.projects.length);
  if (!state.projects.length) { $("project-list").replaceChildren(el("div", "No saved briefs yet. Start with one clear, useful outcome.", "empty")); return; }
  $("project-list").replaceChildren(...state.projects.map((project) => {
    const item = el("article", undefined, "project"); const info = el("div");
    info.append(el("small", `BRIEF SAVED · ${project.run?.state || "NOT STARTED"}`), el("h3", project.title), el("p", project.objective));
    const button = el("button", "Open pre-launch review", "quiet"); button.type = "button";
    button.onclick = () => { activeProject = project.id; renderReview(); $("review").scrollIntoView({ block: "start" }); };
    const kickoff = el("button", project.creativeReady ? "Review approved launch kit" : "Open creative kickoff", "quiet"); kickoff.type = "button";
    kickoff.onclick = () => openCreative(project.id);
    const actions = el("div", undefined, "project-actions"); const execute = el("button", "Open agent execution", "quiet"); execute.type = "button"; execute.onclick = () => openExecution(project.id);
    actions.append(kickoff, execute, button);
    item.append(info, actions); return item;
  }));
}
function renderReview() {
  const project = state.projects.find((p) => p.id === activeProject);
  $("review").hidden = !project;
  if (!project) return;
  $("review-title").textContent = `Pre-launch review / ${project.title}`;
  $("controls").replaceChildren(...state.controls.map((control) => {
    const record = project.reviews.find((r) => r.control === control.id);
    const item = el("article", undefined, "control"); item.append(el("h3", `${control.id} / ${control.name}`), el("p", control.question));
    const form = el("form"); const selectLabel = el("label", "Review status"); const select = el("select");
    for (const [value, label] of [["not-reviewed", "Not reviewed"], ["pass", "Evidence recorded"], ["not-applicable", "Not applicable"], ["blocked", "Unresolved"]]) { const option = el("option", label); option.value = value; select.append(option); }
    select.value = record.status; selectLabel.append(select);
    const evidenceLabel = el("label", "Evidence or applicability reason"); const evidence = el("textarea"); evidence.maxLength = 4000; evidence.value = record.evidence; evidenceLabel.append(evidence);
    const button = el("button", "Save review", "quiet"); button.type = "submit";
    form.append(selectLabel, evidenceLabel, button);
    form.onsubmit = async (event) => {
      event.preventDefault();
      if (reviewBusy) { notice("Another review is being saved. Your draft is still here; try again when it finishes."); return; }
      reviewBusy = true; button.disabled = true;
      try {
        const result = await api(`/api/projects/${project.id}/reviews/${control.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: select.value, evidence: evidence.value }) });
        state.projects = state.projects.map((p) => p.id === result.project.id ? result.project : p);
        renderProjects(); if (activeProject === result.project.id) updateReviewSummary(result.project); notice(`${control.id} review saved. No delivery has been started.`);
      } catch (error) { notice(error.message); } finally { reviewBusy = false; button.disabled = false; }
    };
    item.append(form); return item;
  }));
  updateReviewSummary(project);
}
function updateReviewSummary(project) {
  $("review-summary").textContent = project.reviewComplete ? "All six review records are complete. Operator supplied; independent verification and a separate delivery decision remain. Nothing has been released." : "Review incomplete. Every control needs evidence or an applicability reason; unresolved controls stay visible.";
}
let executionProject; let executionRevision; let executionDisplayedRunId; let executionBusy = false; let executionRequest = 0; let executionTimer;
const liveRun = (run) => run && ["PREPARING", "ADMITTING", "QUEUED", "RUNNING", "STOP_UNCONFIRMED"].includes(run.state);
function renderExecution() {
  const project = state.projects.find((p) => p.id === executionProject);
  $("execution-panel").hidden = !project; if (!project) return;
  executionRevision = project.creative.revision;
  const run = project.run; executionDisplayedRunId = run?.id;
  $("execution-title").textContent = `Agent execution / ${project.title}`;
  $("execution-status").textContent = run ? `${run.state.replaceAll("_", " ")} · ${run.model.name || run.model.id}${run.error ? ` — ${run.error}` : ""}` : project.creativeReady ? "Ready for a connection check and dispatch." : "Choose and approve the current creative package before starting.";
  $("execution-output").textContent = run?.result || "No final answer recorded yet.";
  $("execution-location").textContent = run ? `Project folder: ${run.cwd} · Run ${run.id}` : "A separate local project folder will be created when dispatch starts.";
  $("start-execution").disabled = executionBusy || !project.creativeReady || Boolean(run && ["DONE", "FAILED", "ABORTED", "ADMITTING", "QUEUED", "RUNNING", "STOP_UNCONFIRMED"].includes(run.state) && run.creativeRevision === project.creative.revision);
  $("start-execution").textContent = run && run.submissionId === null ? "Reconnect saved dispatch" : "Start approved brief";
  $("refresh-execution").disabled = executionBusy || !run;
  $("abort-execution").disabled = executionBusy || !run || ["DONE", "FAILED", "ABORTED"].includes(run.state);
}
async function openExecution(id) {
  if (executionBusy) return;
  clearTimeout(executionTimer); const request = ++executionRequest;
  try {
    const [result, connection] = await Promise.all([api(`/api/projects/${id}`), api("/api/execution/connection")]);
    if (request !== executionRequest) return;
    state.projects = state.projects.map((p) => p.id === id ? result.project : p); executionProject = id;
    $("execution-connection").textContent = connection.status === "CONNECTED" ? `Connected to ${connection.deviceName} · ${connection.model.name}. A run can use your model account and modify files on this machine.` : `${connection.status.replaceAll("_", " ")} — ${connection.detail}`;
    renderExecution(); $("execution-panel").scrollIntoView({ block: "start" }); $("execution-title").focus({ preventScroll: true }); scheduleRunRefresh();
  } catch (error) { notice(error.message); }
}
function scheduleRunRefresh() {
  clearTimeout(executionTimer);
  const run = state.projects.find((p) => p.id === executionProject)?.run;
  if (liveRun(run)) executionTimer = setTimeout(() => updateExecution("refresh", true), 3000);
}
async function updateExecution(action, quiet = false) {
  if (executionBusy || !executionProject) return;
  const id = executionProject; const requestedRunId = executionDisplayedRunId; const requestedRevision = executionRevision; let succeeded = false; executionBusy = true; renderExecution();
  try {
    const path = action === "start" ? `/api/projects/${id}/execute` : `/api/projects/${id}/execution${action === "abort" ? "/abort" : ""}`;
    const result = await api(path, action === "refresh" ? undefined : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "start" ? { revision: requestedRevision } : { runId: requestedRunId }) });
    state.projects = state.projects.map((p) => p.id === id ? result.project : p); renderProjects(); succeeded = true;
    if (!quiet) notice(action === "abort" ? (["ABORTED", "DONE"].includes(result.run.state) ? "Pi confirmed this run's stop or completion." : "Stop is not confirmed yet. Refresh will check and stop late-arriving work.") : action === "start" ? "Dispatch saved. Pi owns execution and recovery; inspect its status below." : "Run status refreshed from Pi.");
  } catch (error) { notice(error.message); }
  finally { executionBusy = false; if (executionProject === id) renderExecution(); if (succeeded) scheduleRunRefresh(); }
}
$("start-execution").onclick = () => updateExecution("start");
$("refresh-execution").onclick = () => updateExecution("refresh");
$("abort-execution").onclick = () => updateExecution("abort");
$("close-execution").onclick = () => { if (executionBusy) return; clearTimeout(executionTimer); ++executionRequest; executionProject = undefined; renderExecution(); };
function renderCapabilities() {
  $("capabilities").replaceChildren(...state.capabilities.map((capability) => { const card = el("div", undefined, "connection"); card.append(el("span", capability.status.replaceAll("_", " ")), el("strong", capability.name), el("p", capability.detail)); return card; }));
}
$("brief").onsubmit = async (event) => {
  event.preventDefault();
  if (briefBusy || !state) { notice("Wait for the workspace to be ready before saving."); return; }
  briefBusy = true; const button = event.submitter || $("brief").querySelector("button[type=submit]"); button.disabled = true;
  const payload = { title: $("title").value, outcome: selected, objective: $("objective").value };
  const serialized = JSON.stringify(payload);
  if (!pendingSubmission || pendingSubmission.body !== serialized) pendingSubmission = { body: serialized, key: crypto.randomUUID() };
  try {
    const result = await api("/api/projects", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": pendingSubmission.key }, body: pendingSubmission.body });
    state.projects = [result.project, ...state.projects.filter((p) => p.id !== result.project.id)];
    renderProjects();
    if (!creativeBusy) { ++creativeOpenRequest; creativeProject = result.project.id; renderKickoff(); $("kickoff").scrollIntoView({ block: "start" }); $("kickoff-title").focus({ preventScroll: true }); }
    pendingSubmission = undefined;
    notice("Brief saved. Now explore a visual direction for this project, then prepare its launch kit. Nothing has been dispatched."); if (JSON.stringify({ title: $("title").value, outcome: selected, objective: $("objective").value }) === serialized) $("brief").reset();
  } catch (error) { notice(error.message); } finally { briefBusy = false; button.disabled = false; }
};
$("close-review").onclick = () => { activeProject = undefined; renderReview(); };
try { state = await api("/api/workspace"); renderAesthetics(); renderOutcomes(); renderProjects(); renderCapabilities(); } catch (error) { notice(`Workspace unavailable: ${error.message}`); }
