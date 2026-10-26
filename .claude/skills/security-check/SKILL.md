---
name: security-check
description: Pre-commit security checklist. Use before committing, opening a PR, or when the user asks for a security check of staged changes.
allowed-tools:
  - Bash(git diff *)
  - Bash(git status *)
  - Bash(gitleaks *)
  - Bash(npm audit *)
  - Bash(pip-audit *)
  - Read
  - Grep
  - Glob
---

Run this checklist on the staged changes (`git diff --cached`) and report findings. Do not fix anything without asking first.

1. **Secrets**: run `gitleaks git --staged` (older versions: `gitleaks protect --staged`) if it is installed. Otherwise grep the diff for API keys, tokens, private keys, passwords, and connection strings.
2. **Ignored files**: confirm that no `.env`, key, or credential file is staged (`git status`).
3. **Injection**: look for SQL, shell, or HTML built from unsanitized input.
4. **Auth and crypto**: look for disabled TLS verification, weak hashing (MD5/SHA1 for passwords), or auth bypasses.
5. **Dependencies**: check whether new packages were added. If so, run the ecosystem audit (`npm audit`, `pip-audit`, etc.) and flag unpinned versions.
6. **Logging**: make sure no secrets or PII are logged.
7. **Deep review**: if the diff touches auth, input handling, data access, or dependencies, suggest running the `security-reviewer` agent and pass it the output of `git diff --cached`.

Output a short table with these columns: check, status (pass, warn, fail), file:line, and fix suggestion.
