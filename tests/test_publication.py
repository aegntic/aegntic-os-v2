"""Behavioral regression checks for publication boundaries, using disposable Git repos."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCANNER = Path(__file__).resolve().parents[1] / 'scripts/check_publication.py'


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name)
        self.git('init', '-q')
        self.git('config', 'user.name', 'Publication test')
        self.git('config', 'user.email', 'test@example.invalid')

    def git(self, *args):
        return subprocess.run(['git', '-C', str(self.repo), *args], check=True, capture_output=True)

    def scan(self, mode='index'):
        return subprocess.run([sys.executable, str(SCANNER), '--repo', str(self.repo), '--mode', mode], capture_output=True, text=True)

    def add(self, name, content):
        file = self.repo / name
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(content)
        self.git('add', name)

    def test_public_documentation_and_template_are_allowed(self):
        self.add('README.md', '# Public documentation\n')
        self.add('.env.example', 'DEVICE_TOKEN=replace-at-runtime\n')
        self.assertEqual(self.scan().returncode, 0)

    def test_private_file_is_refused_even_if_force_added(self):
        self.add('.private/continuation.md', 'Private task notes\n')
        self.assertEqual(self.scan().returncode, 1)

    def test_deleted_secret_remains_detected_in_history_without_echoing_it(self):
        token = 'ghp_' + 'X' * 36
        self.add('mistake.txt', token)
        self.git('commit', '-qm', 'Synthetic fixture')
        self.git('rm', 'mistake.txt')
        self.git('commit', '-qm', 'Remove synthetic fixture')
        result = self.scan('history')
        self.assertEqual(result.returncode, 1)
        self.assertNotIn(token, result.stdout + result.stderr)

    def test_private_alias_with_identical_blob_remains_detected_after_deletion(self):
        self.add('public.txt', 'Identical innocent content')
        self.git('commit', '-qm', 'Public fixture')
        self.add('private/handoff.md', 'Identical innocent content')
        self.git('commit', '-qm', 'Private alias fixture')
        self.git('rm', 'private/handoff.md')
        self.git('commit', '-qm', 'Delete private alias')
        self.assertEqual(self.scan('history').returncode, 1)

    def test_configured_token_is_refused_without_echoing_it(self):
        token = os.urandom(24).hex()
        (self.repo / '.env').write_text('DPI_TOKEN=' + token + '\n')
        self.add('accidental-note.md', token)
        result = self.scan()
        self.assertEqual(result.returncode, 1)
        self.assertNotIn(token, result.stdout + result.stderr)

    def test_private_canary_in_ordinary_filename_is_refused(self):
        self.add('notes.md', 'AEGNTIC_' + 'PRIVATE_CONTINUATION')
        self.assertEqual(self.scan().returncode, 1)


if __name__ == '__main__':
    unittest.main()
