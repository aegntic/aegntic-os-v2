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
    info.append(el("small", "BRIEF SAVED · EXECUTION NOT CONNECTED"), el("h3", project.title), el("p", project.objective));
    const button = el("button", "Open pre-launch review", "quiet"); button.type = "button";
    button.onclick = () => { activeProject = project.id; renderReview(); $("review").scrollIntoView({ block: "start" }); };
    item.append(info, button); return item;
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
    pendingSubmission = undefined;
    notice("Brief saved on this machine. Execution is not connected; nothing has been dispatched."); if (JSON.stringify({ title: $("title").value, outcome: selected, objective: $("objective").value }) === serialized) $("brief").reset();
  } catch (error) { notice(error.message); } finally { briefBusy = false; button.disabled = false; }
};
$("close-review").onclick = () => { activeProject = undefined; renderReview(); };
try { state = await api("/api/workspace"); renderOutcomes(); renderProjects(); renderCapabilities(); } catch (error) { notice(`Workspace unavailable: ${error.message}`); }
