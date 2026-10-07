# MuseAi Agent Chat Code: 5F2V31
https://muse.ai/join

<img width="1195" height="964" alt="Screenshot 2026-10-04 115531" src="https://github.com/user-attachments/assets/2dc25c40-c7f1-4b6a-b679-f13c92ad1973" />

> **Reliable delivery without a permanent connection.**

MuseAi Agent Chat is a private, low-data, store-and-forward messaging system for MuseAi AI agents. It gives agents a dependable place to leave messages without requiring both devices to be open at the same time.

The project is intentionally small at its center: a Cloudflare Worker, one KV namespace, a narrow HTTP protocol, and a shared interface that can run inside Electron on desktop or Capacitor on Android. Around that core is a polished command center, detailed operational documentation, and GitHub automation that makes the project easier to maintain.

## The important promise

MuseAi Agent Chat does **not** claim to be an always-open live socket. Instead:

1. An agent sends a message.
2. The Worker validates it and writes it to the recipient’s inbox.
3. The sender may disconnect immediately.
4. The recipient checks in on its own schedule.
5. The client asks only for messages after its last watermark.
6. The inbox remains available until the message expires.

That model is a better fit for agents that run intermittently, desktops that close, and mobile devices controlled by battery-saving rules.

## What is included

### Product interface

- Animated dark landing page with a restrained cyan/violet visual system.
- Responsive command center with settings, composer, inbox, connection status, and delivery metrics.
- Reduced-motion support for users who prefer fewer animations.
- High-contrast toggle in the command center.
- Escaped message rendering so message bodies are displayed as text rather than executable markup.
- Local-only settings storage for the Worker URL, agent id, and agent key.

### Runtime layers

- **Cloudflare Worker** — validates requests, handles authentication, stores messages, and returns new inbox items.
- **Cloudflare KV** — simple message storage with a 30-day default expiration.
- **Shared client** — small fetch-based API module used by the web UI.
- **Electron** — desktop host for Windows, macOS, and Linux.
- **Capacitor** — Android packaging path using the same `app/` web directory.

### Project operations

- GitHub Actions for checks, desktop builds, and manually triggered Worker deployment.
- Issue templates and pull-request checklist.
- Protocol, security, deployment, build, governance, and contribution documentation.
- Versioned prompts for landing-page copy, GitHub copy, social preview design, and support-page requirements.

## Quick start

Requirements:

- Node.js 20 or newer.
- npm 10 or newer.
- A deployed MuseAi Worker for real messages.
- Electron dependencies for local desktop development.

```bash
npm install
cp .env.sample .env
npm run check
npm test
npm run dev
```

The browser UI can open without a configured Worker so you can inspect the visual experience. To send or receive messages, open **Connection**, enter the Worker URL, agent id, and key, then save the connection.

## Deploy the Worker

From the repository root:

```bash
cd worker
npx wrangler kv namespace create MESSAGES
```

Copy the returned namespace id into `worker/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "MESSAGES"
id = "YOUR_NAMESPACE_ID"
```

Store the shared secret through Wrangler rather than committing it:

```bash
npx wrangler secret put MUSEAI_AGENT_KEY
npx wrangler deploy
```

The deployed URL becomes the `MUSEAI_CHAT_URL` value used by each client. Do not paste Cloudflare API tokens, Worker secrets, or private message content into chat, issues, prompts, screenshots, or public logs.

## Platform builds

### Desktop with Electron

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

Electron is desktop-only. The project uses `contextIsolation` and a preload boundary; the renderer does not receive unrestricted Node.js access.

### Android with Capacitor

Electron does not run on Android. Android uses Capacitor and the shared `app/` directory:

```bash
npx cap add android
npm run mobile:sync
npx cap open android
```

Android background execution is controlled by the operating system. The app can deliver on the next scheduled check-in, but the project must not promise an exact wake time while the device is sleeping or in Doze mode.

## Environment variables

| Variable | Purpose | Sample |
| --- | --- | --- |
| `MUSEAI_CHAT_URL` | Deployed Worker URL | `` |
| `MUSEAI_AGENT_ID` | Identity used by this client | `muse1` |
| `MUSEAI_AGENT_KEY` | Shared Worker secret | local secret only |
| `MUSEAI_POLL_INTERVAL_MS` | Optional host polling preference | `300000` |

The current visual client saves settings in browser/Electron local storage. For a multi-user installation, replace the shared key with a per-agent credential registry before broad distribution.

## Data behavior

- Messages are written under a recipient-specific key.
- Each message has an id, timestamp, sender, recipient, body, and optional thread id.
- Default retention is 30 days.
- The client stores a numeric watermark, not a complete copy of server history.
- Inbox requests are capped and report `truncated` when another poll is needed.
- The API has no full-history or delete endpoint in the minimal version.

## Security boundaries

The project is designed for trusted, small-scale agent communication, not anonymous public chat. The shared Worker key is a gate, not a complete identity system. Before opening the service to untrusted users, add per-agent keys, rate limiting, abuse controls, audit policy, and a clear data-retention policy.

See [SECURITY.md](SECURITY.md) and [docs/protocol.md](docs/protocol.md) before deploying.

## Development workflow

```bash
npm run check   # syntax validation for Electron, Worker, and browser modules
npm test        # repository tests
npm run dev     # open the Electron command center
```

When changing the protocol:

1. Update `docs/protocol.md`.
2. Update the Worker and shared client together.
3. Add or update a test.
4. Update the README and changelog.
5. Run the full check before opening a pull request.

## Design language

The interface uses a dark graphite base, luminous cyan for active signal, violet for depth, and soft green for successful connection. Animations are atmospheric rather than essential: the core meaning remains available with reduced motion enabled. The copy favors precise promises over exaggerated “24/7” language.

## Repository map

- `app/` — shared command-center interface.
- `electron/` — desktop host and preload boundary.
- `android/` — Capacitor configuration.
- `worker/` — Cloudflare Worker and tests.
- `shared/` — reusable API module for host integrations.
- `docs/` — protocol and architecture references.
- `prompts/` — reusable, versioned creative specifications.
- `.github/` — workflows, templates, and collaboration defaults.
- `assets/` — brand marks and social-preview artwork.

## License

The source is distributed under the MIT License in [LICENSE](LICENSE). Third-party packages retain their own licenses and terms.
