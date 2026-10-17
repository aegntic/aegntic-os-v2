#!/usr/bin/env python3
"""Check Git objects for private paths and high-confidence secret markers.

Defense in depth, not an exhaustive secret detector. Findings never print values.
"""
import argparse
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args])


def private_path(name):
    path = PurePosixPath(name)
    parts = {part.lower() for part in path.parts}
    base = path.name.lower()
    return bool(parts & {'.private', 'private', '.data', 'credentials', 'private-continuation'}) or (
        base.startswith('.env') and base not in {'.env.example', '.env.sample', '.env.template'}
    ) or base in {'auth.json', 'credentials.json', 'source.bundle'} or base.endswith(
        ('.db', '.db-wal', '.db-shm', '.sqlite', '.sqlite3', '.pem', '.key', '.bundle')
    ) or base.startswith(('private-handoff', 'private-continuation', 'aegntic-complete-inventory'))


PATTERNS = [
    re.compile(rb'sk-(?:proj-|ant-)?[A-Za-z0-9_-]{24,}'),
    re.compile(rb'gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}'),
    re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    re.compile(rb'AEGNTIC_' + rb'PRIVATE_CONTINUATION'),
]


def configured_secrets(repo):
    values = set()
    for relative in ['.env', '.data/pi-runtime.env']:
        file = repo / relative
        if not file.is_file():
            continue
        for line in file.read_text(errors='replace').splitlines():
            key, separator, value = line.partition('=')
            value = value.strip().strip('\"\'')
            if separator and re.search(r'(TOKEN|API_KEY|SECRET|PASSWORD)', key) and len(value) >= 24:
                values.add(value.encode())
    return values


def objects(repo, mode):
    if mode == 'history':
        # Every tree path matters: object listings can omit identical-content aliases.
        for commit in git(repo, 'rev-list', '--all').decode().splitlines():
            for record in git(repo, 'ls-tree', '-r', '-z', commit).split(b'\0'):
                if not record:
                    continue
                metadata, name = record.split(b'\t', 1)
                _, kind, oid = metadata.split()
                if kind == b'blob':
                    yield oid.decode(), name.decode()
    else:
        for record in git(repo, 'ls-files', '--stage', '-z').split(b'\0'):
            if not record:
                continue
            metadata, name = record.split(b'\t', 1)
            _, oid, stage = metadata.split()
            if stage != b'0':
                raise RuntimeError('Resolve unmerged files before publication.')
            yield oid.decode(), name.decode()


def check(repo, mode):
    findings = []
    secrets = configured_secrets(repo)
    seen = set()
    for oid, name in objects(repo, mode):
        if private_path(name):
            findings.append((name, 'private path'))
        if oid in seen:
            continue
        seen.add(oid)
        content = git(repo, 'cat-file', 'blob', oid)
        if any(pattern.search(content) for pattern in PATTERNS):
            findings.append((name, 'credential/private marker'))
        elif any(secret in content for secret in secrets):
            findings.append((name, 'configured credential'))
    for name, reason in sorted(set(findings)):
        # Public paths only; no matched value or surrounding source is printed.
        print(f'BLOCKED: {name} ({reason})')
    if not findings:
        print(f'PASS: {mode} Git objects contain no detected private paths or credential markers.')
    return 1 if findings else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--mode', choices=['index', 'history'], default='index')
    args = parser.parse_args()
    try:
        return check(args.repo.resolve(), args.mode)
    except (OSError, subprocess.CalledProcessError, RuntimeError):
        print('BLOCKED: publication check could not complete. Inspect repository state locally.')
        return 2


if __name__ == '__main__':
    sys.exit(main())
