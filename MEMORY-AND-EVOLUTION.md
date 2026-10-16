# Memory and controlled agent evolution

Research addition, 16 October 2026. Status: EVALUATION CANDIDATES; no installation, private-data upload, provider rerouting or runtime change.

## Two independent inputs

**TencentDB Agent Memory:** the screenshot reflects an earlier release. The current default branch, `feat/server_team`, was resolved through GitHub's repository/commit API to `e9a82935b52741e0c798c75326e90b7144eb4d5f` (15 October 2026). Its README describes a team hub with chat memory, skills, wiki and code-graph assets. It explicitly acknowledges CodeGraph code, Hermes skill code and Karpathy's LLM Wiki concept; this is not proof of ancestry with Pi Durable or SelfSearch. Current root LICENSE contains an MIT grant, despite GitHub's API reporting NOASSERTION. Component notices still require inspection before adoption.

**SelfSearch:** arXiv 2609.37968v2 describes successive agent-harness revisions informed by earlier modification records. Model weights stay fixed. Search does not use downstream benchmark rewards, but local checks remain available and downstream evaluation is separate. The paper reports an individual-agent gain of up to 11.2 percentage points and a 38.5% execution-cost reduction on one shared-success subset; neither is a prediction for Aegntic. No licensed implementation release was established in this assessment.

Sources:
- https://github.com/TencentCloud/TencentDB-Agent-Memory/tree/e9a82935b52741e0c798c75326e90b7144eb4d5f
- https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/e9a82935b52741e0c798c75326e90b7144eb4d5f/LICENSE
- https://arxiv.org/html/2609.37968v2

These projects are complementary research inputs. No upstream relationship between them is asserted. Screenshot benchmark percentages are author claims from that version, not reproduced Aegntic measurements.

## Proposed Aegntic boundaries

| Boundary | Owner |
| --- | --- |
| Active task, submission identity, checkpoints and recovery | Existing Pi Durable runtime |
| Briefs, approvals and run projection | Existing local app; preferred Convex shared backend when needed |
| Reusable context and knowledge | One selected memory service behind an explicit adapter |
| Proposed changes to tools/instructions | Isolated Agent Evolution experiment, versioned in Git |
| Qualification and release decision | Fixed tests, independent result verification and human review |

Tencent joins the memory evaluation shortlist alongside the existing Rust cognitive-os-engine candidate. It does not become a second canonical service by default. GBrain remains excluded. Rust remains our preference for suitable new services, not a reason to rewrite upstream memory code.

Prefer scoped, explicit memory tools for the first experiment rather than routing every provider through a new transcript proxy. An adapter accepts project/user scope and a bounded query; returns source references, timestamps and versioned context; and records which entries were used. Retrieved text is untrusted context. It cannot approve a creative package, grant permissions, establish task completion or replace durable receipts. Keep credentials, private contact lists and unrestricted transcripts out of memory ingestion.

The evolution path is: sanitized failure/event evidence → candidate proposal in an isolated checkout → fixed budget and tests → comparative report → reviewed version. Preserve externally controlled budgets, permission gates and evaluation records. Do not store or require hidden chain-of-thought; use observable tool calls, results, diffs and brief decision summaries. No self-editing of the running production service or automatic deployment.

## First qualification experiment

Use synthetic projects only. Compare the current no-memory baseline, a simple source-linked notes baseline, the Rust candidate and a pinned Tencent configuration under the same task set, context budget and model settings.

Measure factual recall, source correctness, instruction contamination, repeated-work reduction, latency, tokens and total model/extraction cost. Seed contradictory facts, outdated decisions, malicious retrieved instructions and cross-project canaries. Test explicit correction/deletion, restart persistence, scope isolation and export/restore. A memory summary must not recreate a deleted fact from retained raw records.

For evolution, replay one reproducible failure, propose a bounded repair, and measure on held-out behavioral/failure cases. Evaluation code stays outside the candidate checkout. Record baseline/candidate SHAs and all costs. Success must preserve creative approval, cancellation and external-action boundaries.

No memory runtime is connected. Further source/API/dependency review and actual behavioral tests are required before choosing a winner or claiming gains.
