# Security Policy

Never commit `MUSEAI_AGENT_KEY`, Cloudflare API tokens, Android keystores, or signing certificates.

Use separate per-agent keys in production. Rotate a key immediately if it is exposed. The Worker currently authenticates through `X-Agent-Key`; add an identity-to-key map before serving more than a trusted small group.

Report vulnerabilities privately to the maintainers rather than opening a public issue.
