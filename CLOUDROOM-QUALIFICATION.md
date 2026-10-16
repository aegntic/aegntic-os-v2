# Cloudroom qualification — 16 October 2026

Decision: retain as a worker-host candidate; not production-qualified and not connected to the application. Existing Pi Durable execution is unchanged.

## Reproduced environment

- Upstream https://github.com/davidondrej/cloudroom-core at d44dd8b9a6d272a5f601b980c00fade202d00d4c, package 0.1.57, Apache-2.0. Checkout and Cargo.lock unchanged.
- Linux workstation; Rust/Cargo 1.98.0. No system installation, service accounts, systemd units, paid infrastructure or remote endpoints were created.
- Existing default parallel linking stalled before tests; stopped that attempt and its owned linker processes. Retried with `CARGO_BUILD_JOBS=1` and `RUSTFLAGS='-C link-arg=-Wl,--threads=1'`. This built successfully. These are command-local settings, not repository changes.
- HTTP checks used the real Rust service with disposable local journals/workspaces and upstream Pi/Codex protocol fixtures. Loopback-only unprotected test mode bypasses production containment; no cgroup/security-isolation claim is made.

## Results

| Check | Result |
| --- | --- |
| cargo fmt --check | PASS |
| cargo clippy --locked --all-targets -- -D warnings, with environment above | PASS |
| cargo test --locked --all-targets --no-fail-fast, with environment above | FAIL: 40 passed, 1 failed across targets |
| Focused real HTTP lifecycle checks | PASS: 4 tests |
| Installed native Pi CLI RPC get_state, temporary empty home, no credentials/inference | PASS: @earendil-works/pi-coding-agent 1.2.0 |
| Existing Pi Durable session hosted/transferred through Cloudroom | NOT IMPLEMENTED / NOT QUALIFIED |
| Real model execution inside Cloudroom | NOT RUN |
| Tenant isolation, protected cgroups and deployment recovery | NOT QUALIFIED |

Focused HTTP tests:

```
cd tests
python3 -m unittest -v \
  pi_http.MixedHarnessTests.test_same_api_queue_interrupt_replay_and_restart \
  core_fixture.ReplayTests.test_loopback_http_needs_no_permission_and_remains_authenticated \
  core_fixture.RecoveryTests.test_graceful_restart_preserves_queue_and_close_settles_it \
  core_fixture.RecoveryTests.test_manual_stop_keeps_queue_paused_across_restart_until_resume
```

The mixed harness check covers duplicate queue requests, conflicting request rejection, real fixture child-process interruption, SSE cursor replay, native identity after restart and continued requests. The other checks cover authenticated loopback access, durable close and manual-stop pause across restart. Fixtures prove protocol/service behavior, not model-provider compatibility or exactly-once external effects.

## Repeatable failure

`runtime::linux::tests::a_full_disk_stops_the_writing_tool_command_not_the_harness` failed in the first suite and the full no-fail-fast run. At `src/runtime/linux.rs:428` the selected command was `sleep 30`, while the assertion required the writing shell. The test simulates a marked workload containing a writer and idle processes; it does not fill the physical disk.

The selector uses process disk-write counters and falls back to process age when counts are unavailable/tied. We have not established whether this failure comes from the host's accounting, process lifetime/identity or a selector defect. Do not treat disk-pressure cleanup as qualified. No upstream source was patched or failing test skipped. Confirm on the intended isolated Linux host, inspect process accounting and repair/verify the selection before rollout.

## Integration consequence

Cloudroom invokes a standard Pi CLI using `--mode rpc` over process stdin/stdout. Our exact disler/durable-pi pin is an Express HTTP/SSE device server backed by @earendil-works/pi-durable 1.0.3; its package has no Pi CLI RPC entry point. Pointing CLOUDROOM_PI_BINARY at that backend is not an adapter.

Keep the existing direct Pi Durable connection. A later bounded worker adapter can submit Cloudroom coding sessions under a Pi-owned stage, persist `(run, stage, attempt, core, session, request_id)`, reconcile saved receipts after lost responses and require confirmed stop before replacement. Cloudroom session restart is not a substitute for Pi Durable recovery, and native Pi sessions are not automatically portable durable-pi sessions.

Next qualification: resolve the disk-selection failure, then add the bounded adapter and run a synthetic file-output stage through the actual Pi → Cloudroom → worker path, including restart/disconnect/cancel. Public build execution still requires the existing creative approvals.

Evidence: artifacts/product-foundry/cloudroom/{cargo-test.log,clippy.log,http-lifecycle.log,native-pi-rpc.json}. No credentials or model responses are included.
