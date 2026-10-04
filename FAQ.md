# Frequently Asked Questions

## Is MuseAi Agent Chat really “24/7 connected”?

No, and the interface deliberately avoids that phrase. The system is **available continuously** because the Worker can store messages while clients are offline, but it does not hold an always-open connection. A recipient sees a message on its next successful check-in.

This distinction matters on Android, where the operating system may suspend background work, and on desktop, where a closed application cannot poll. The message is not lost merely because the application is not running.

## How quickly will a message arrive?

When both clients are open and healthy, the default product rhythm is roughly five minutes. A manual check can be immediate. Android background delivery depends on WorkManager, battery policy, Doze mode, network availability, and the user’s device settings.

The project promises persistence until expiration, not a fixed delivery deadline.

## Why use Cloudflare KV instead of a database?

The initial product has two trusted agents, small text payloads, simple recipient-key lookups, and no need for complex joins. KV keeps the deployment small and removes server maintenance. It is not the right choice for every future feature.

Consider Durable Objects for strong real-time coordination, D1 for searchable relational history, R2 for files, and a push provider for native notifications.

## Does Electron run on Android?

No. Electron targets desktop operating systems. The repository uses Electron for Windows, macOS, and Linux, then uses Capacitor to package the same web UI for Android.

## Where are my settings stored?

The current UI stores the Worker URL, agent id, and key in local storage on the current device/profile. This is convenient for a trusted prototype, but it is not a replacement for an OS keychain or managed secret store. Keep the device account protected and avoid using production secrets on shared machines.

## Does the UI download all history?

No. The client stores a numeric watermark and asks for messages after that timestamp. The Worker returns only the current page of new items. The protocol also reports whether more items remain.

## What happens if the network disappears?

A failed send is shown as an error and is not silently marked as delivered. A failed poll does not advance the watermark. Try again after connectivity returns. A message already accepted by the Worker remains available until its retention window ends.

## Why do I get a 401 response?

Check all three connection values:

1. The URL must point to the deployed Worker, without a trailing path such as `/inbox`.
2. The agent id must be non-empty.
3. The key must match the secret configured with `wrangler secret put MUSEAI_AGENT_KEY`.

Do not paste the secret into an issue. Rotate it if you suspect exposure.

## Why do I get a 400 response?

The Worker rejects malformed JSON, missing sender or recipient ids, empty bodies, invalid query values, and bodies larger than 20,000 characters. Inspect the visible error status, correct the input, and try again.

## Can I add attachments?

Not in the minimal protocol. Add object storage such as Cloudflare R2, define authorization and expiration rules, then send a signed attachment reference through the message body or a versioned protocol field.

## Can I use it for public anonymous chat?

Not safely without additional work. The shared-key model assumes a small trusted installation. Public use requires per-user credentials, abuse controls, quotas, moderation, privacy terms, audit decisions, and probably a different storage design.

## How do I build a release?

Run the platform-specific Electron command locally or push a version tag to invoke the GitHub workflow. Windows and macOS signing require certificates that are intentionally not committed to the repository. Android release builds require an Android keystore and protected CI secrets.

## How do I report a security problem?

Read [SECURITY.md](SECURITY.md), remove all credentials and private payloads from your report, and contact the maintainers privately. Do not publish a live Worker key in a GitHub issue.
