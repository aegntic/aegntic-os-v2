# Connected agent execution

The local workspace dispatches approved briefs to real Pi Durable sessions. The active connection uses the existing Codex account sign-in with `gpt-6.1-sol`. Pi Durable owns tools, model turns, checkpoints and recovery. The Bun app stores project/run references and displays status; it is not a second workflow scheduler.

## Use

1. Save a brief and approve its current creative package.
2. Choose **Open agent execution** beside that brief.
3. Choose **Start approved brief**. The panel shows the model, run state, project folder and final answer.
4. **Refresh run** reconnects to Pi. **Stop agent** targets the displayed run. Closing the browser does not stop execution.

Files live below the configured `AEGNTIC_PI_WORKSPACE_ROOT`, one project/revision per folder. A model answer is not an independent verification of the requested outcome; inspect its files and evidence. Deployment and publishing remain separate user decisions.

This is a trusted, single-user local worker. Its working directory and prompt constrain the task, but they are not an OS sandbox. Pi's Node execution environment runs with the current user's filesystem privileges. Only read/write/edit/bash are offered to this integration; upstream demo shared-state, job, publishing and delegation tools are excluded. Worker shell environments omit model/device credentials, and the browser never receives those credentials. Do not expose the app or device publicly as a multi-tenant service.

## Runtime and provenance

- Disler / IndyDevDan: https://github.com/disler/durable-pi at `37165c619573dbaf425463038bbffecfe576beec`.
- Underlying packages: `@earendil-works/pi-durable`, `pi-ai` and `chord` at 1.0.3, resolved by the upstream backend's existing npm lockfile.
- Retained npm and Node runtime for the upstream backend. Node 26.7.0 was used for qualification; upstream package engines accept >=22.19 and the repository recommends Node 24.
- New Bun host/UI code has no external runtime dependency.
- Local patch: `integrations/pi-durable/provider-support.patch`. It adds Anthropic support, read-only access to an existing Codex sign-in, a read-only submission lookup by request ID, and a coding-only tool profile. The device advertises `aegnticRecovery: 1`; the client requires this extension as well as v1 / durable 1.0.3.
- Original MIT notice is preserved verbatim in `integrations/pi-durable/UPSTREAM_LICENSE`. See THIRD_PARTY_NOTICES.md.

The stock pinned backend supports OpenRouter and a faux test provider. The faux provider is never accepted as a connected execution model. Anthropic was tested first; its environment endpoint points to an unavailable local proxy. Codex subsequently passed actual model and filesystem-tool checks. The adapter reads the current Codex access token from the existing auth file for each model request, checks expiry, and neither copies nor refreshes/mutates the original token file. When that sign-in expires, refresh it through Codex and reconnect.

## Start the configured local pair

From this project, run `bun run start:connected`. This supervises the Bun app and the Node Pi backend together and shuts down its child processes when stopped. It checks the pinned checkout and applied patch before launch. It does not install a boot-time service, provision infrastructure or create recurring jobs.

The private `.env` contains the Pi URL, device token, checkout path and project workspace root. `.data/pi-runtime.env` contains device settings and the same randomly generated token. Both are ignored by Git and owner-readable only. Runtime state lives under `.data/pi-home/backend`. Back up the application DB, Pi catalog and session DBs together. Do not rotate or replace a device identity without reconciling saved runs.

## Reproduce on another machine

Use the upstream Git URL and pinned commit above. Apply the delivered patch with `git apply /absolute/path/to/provider-support.patch`. In `apps/dpi-backend`, use the upstream lockfile with `npm ci --ignore-scripts --no-audit --no-fund`, then `npm run check` and `npm test`. No upstream manifest or lockfile change is required.

Create owner-readable private configuration with a random device token of at least 32 characters. The app fields are documented in `.env.example`. Set the upstream device fields `DPI_TOKEN`, `DPI_PROVIDER=codex`, `DPI_HOST=127.0.0.1`, `DPI_PORT=4780`, `DPI_HOME`, `DPI_DATA_DIR`, `DPI_START_DIRS`, `DPI_DEVICE_NAME`, and `DPI_MODEL=gpt-6.1-sol` in `.data/pi-runtime.env`. `DPI_CODEX_AUTH_FILE` optionally selects an existing auth file; the default is the current user's `.codex/auth.json`. Sign in normally through Codex. Then use `bun run start:connected`.

A valid Anthropic environment can instead use `DPI_PROVIDER=anthropic`, an available catalog model, and provider credentials inherited by the backend process. `ANTHROPIC_BASE_URL`, if present, must be HTTPS or loopback HTTP. Do not put provider credentials in browser data or CLI arguments. OpenRouter remains supported by upstream when configured. The initial app uses the device's default model; model selection in the UI is future work.

## Retry, recovery and stop behavior

A stable saved run ID is used as both the session idempotency key and Pi message request ID. Per-project/revision uniqueness prevents duplicate dispatch. Lost session creation responses are recovered by session name plus working directory, including after the upstream 24-hour idempotency cache expires. Lost message responses are recovered through Pi's durable submission lookup without resending or requiring renewed creative approval.

Approval is checked before reserving work and again immediately before message submission. Editing the package blocks new dispatch; it does not silently stop already-running work. Only one non-terminal run per project is admitted by this app. Completed, failed or aborted revisions are not implicitly rerun.

Stop persists intent before network calls, withdraws the exact queued submission and aborts its agent, then checks the upstream terminal state. A lost/late admission or unavailable stop response stays `STOP_UNCONFIRMED`. Refresh retries cancellation when the submission becomes visible. Closing the page pauses this app's observation/cancellation retries; reopen and refresh an unconfirmed stop. No background retry daemon is implied. An unanswered non-cancelled model turn is `FAILED`, not a successful completion.

The initial view shows final answers and status polling, not token-by-token/tool-output streaming. Run records and final answers survive host restarts; Pi handles active workflow recovery.

## Qualification

See `artifacts/product-foundry/agent-execution/evidence.md` and `live-execution-qualification.json`. A real agent wrote and read a small file; the host independently checked its contents. This happened in a separate qualification DB/folder with explicit test-fixture approval records. No user project was approved or dispatched during integration testing. Convex, Cloudroom, other model providers, creative rendering and publication remain unconnected.
