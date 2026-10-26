# Project instructions for AI coding agents

Claude Code, Codex, Cursor and similar tools read this file. Keep it short.

## Commands
- Install: none (plain HTML/CSS/JS)
- Git hooks: `pre-commit install` (gitleaks runs on every commit)
- Run: `python3 -m http.server 8000`

## Security rules (non-negotiable)
- Never read, print, log, or commit secrets: `.env*` (except `.env.example`), keys, tokens, credentials.
- Never hard-code secrets. Load them from environment variables and add placeholders to `.env.example`.
- Never disable TLS verification, auth checks, or input validation to make something "work".
- Use parameterized queries. Never build SQL or shell commands from string concatenation with user input.
- Do not add a dependency without saying why. Prefer well-maintained packages and pin versions via the lockfile.
- Ask before: `git push`, deleting files outside the task, changing CI/CD, or touching infra/IAM.
- If you find an exposed secret, stop and tell the user. Do not "fix" it silently, because it must be rotated.

## Conventions
- Vanilla HTML/CSS/JS, no build step. Files: index.html, styles.css, app.js.
- Run the `security-check` skill before proposing a commit.
