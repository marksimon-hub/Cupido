# Cupido

An interactive "Would you like to go out with me?" page: the No button runs away, Yes leads to picking dinner, cinema or cafe, then a date and time.

## Setup

1. Copy `.env.example` to `.env` and fill in real values. Never commit `.env`.
2. No dependencies. Open `index.html` or run `python3 -m http.server`.
3. Install git hooks: `pip install pre-commit && pre-commit install`

## Development

- Run: `python3 -m http.server 8000`

## Security

See [SECURITY.md](SECURITY.md). AI coding agents follow the rules in [AGENTS.md](AGENTS.md).
