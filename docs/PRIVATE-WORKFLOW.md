# Public work, private continuity

A GitHub README, its comments, diagrams, collapsed sections, image metadata and history are public in a public repository. There is no access-controlled private section inside this README.

## The two boundaries

| Public repository | Private continuation outside the checkout |
| --- | --- |
| Reviewed source, notices, reproducible setup and public evidence | Internal handoff, research inventories, configuration, runtime state and project/session records |
| Public roadmap and sanitized screenshots | Encrypted checkpoint and separately stored decryption material |
| No account tokens, subscribers or credential-bearing databases | Owner-readable local state; no public URL or committed archive |

The current operator has prepared a private continuation area outside this repository. Its actual path, key material and internal notes are intentionally absent from public documentation. The public source does not embed a link that grants access to it.

## Continue safely

1. Open the private continuation handoff on the trusted machine. It records the public commit, current decisions, private paths, next steps and checkpoint recovery instructions.
2. Keep credentials and operational records in private configuration/storage. Never paste them into issues, commits, README comments, screenshots, logs or diagram labels.
3. Work in the public checkout only on source and documents cleared for publication. Keep private research outside it.
4. Run the publication check before committing and pushing:

```sh
python3 scripts/check_publication.py --mode index
python3 scripts/check_publication.py --mode history
python3 -m unittest discover -s tests -p 'test_publication.py' -v
```

5. Enable the delivered hooks on each trusted clone after reviewing them:

```sh
git config --local core.hooksPath .githooks
```

The current clone has the hooks enabled. Other clones do not automatically inherit Git configuration. Preserve any existing hooks when adopting this setup elsewhere. The pre-commit check scans indexed objects; pre-push also scans reachable history. GitHub Actions repeats the checks after publication and on pull requests; it does not prevent the initial upload by itself.

## What the checks cover

Private path names and database/key/bundle files are rejected even when force-added. The checker recognizes selected provider/private-key patterns, a continuation canary and the configured device/provider secrets available in this clone's private environment files. Findings print file names and categories, never matched values. A credential removed in a later commit still causes the history check to fail.

These are detection rules, not proof that arbitrary sensitive prose or every credential format is absent. Local hooks can be bypassed; they are not OS access control or branch protection. Do not claim that `.gitignore`, robots rules, `noindex` or an unlisted link makes information private. Keep actual private content outside the public source boundary.

## Checkpoints and recovery

The operator checkpoint is encrypted, with its decryption material stored separately outside the public checkout. Private configuration and database contents are not in this repository. The checkpoint includes the public source/history, private app state and selected continuation artifacts; the private manifest identifies the exact scope and exclusions.

Live SQLite databases are copied through SQLite's backup API for per-database consistency. Separate app/Pi databases are not one atomic cross-service snapshot. Before disaster-recovery use, reconcile run and submission identities using EXECUTION.md; refresh upstream state before dispatching or retrying work. Regenerable dependencies can be restored from their preserved lockfiles. Existing Codex sign-in remains managed by Codex and is not copied into the checkpoint.

No private GitHub repository, cloud backup or off-machine key escrow has been created. An encrypted local checkpoint does not protect against loss of the whole machine; maintain a separately authorized private backup location for that threat.

## If something was already disclosed

Stop publishing, revoke or rotate exposed credentials through their owning service, assess the disclosure, then plan history cleanup. Removing a current file cannot retract copies already fetched from a public remote. This change does not rewrite history or rotate account credentials.
