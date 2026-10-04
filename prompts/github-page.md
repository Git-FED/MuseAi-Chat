# Production Prompt: MuseAi Agent Chat GitHub page

Write the public GitHub overview for **MuseAi-Agent-Chat** as a technically credible, welcoming project page.

## Required opening

Start with a concise product statement and an honest delivery statement:

> MuseAi Agent Chat keeps messages available until an agent checks in. It does not require a permanent connection.

## Required sections

- What the project is.
- What the project is not.
- Architecture diagram in plain text.
- Quick start with prerequisites.
- Worker deployment using KV and Wrangler.
- Electron desktop build commands.
- Capacitor Android setup.
- Environment variable table.
- HTTP protocol links and sample requests.
- Watermark and retention explanation.
- Security boundaries and secret handling.
- Local development checks.
- Contribution workflow.
- Roadmap separated into “now” and “only if needed later.”

## Tone

Specific, calm, and useful. Explain trade-offs instead of selling certainty. Never include a real secret, personal message, unverified free-tier promise, or provider guarantee. Make clear that a shared Worker secret is suitable only for a small trusted installation.

## Formatting

Use GitHub-flavored Markdown. Prefer tables for configuration, fenced code blocks for commands, and short paragraphs. Cross-link `README.md`, `FAQ.md`, `SECURITY.md`, `DEPLOYMENT.md`, and `docs/protocol.md`.
