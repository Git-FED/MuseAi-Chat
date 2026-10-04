# MuseAi Agent Chat Architecture

## Overview

The system is a store-and-forward path between intermittent clients. Clients do not need a shared session. The Worker is stateless between requests; KV is the durable middle layer for the current small-scale use case.

```text
Electron / Capacitor / CLI
          |
          | HTTPS + X-Agent-Key
          v
Cloudflare Worker
   |       |       |
 /send  /inbox  /health
          |
          v
     Cloudflare KV
```

## Request lifecycle

A send request is authenticated, parsed, validated, assigned a server timestamp and UUID, then written under a recipient-prefixed key with expiration. A poll request authenticates the client, lists the recipient prefix, filters keys after the supplied watermark, reads the selected values, sorts them oldest-first, and returns a new watermark.

The client only advances its local watermark after a successful response. That makes retries safe when a device loses power or network connectivity during a request. At-least-once presentation is preferred over silently losing a message.

## Client layers

The shared fetch module owns URL construction, headers, request failure handling, and the JSON contract. The web UI owns local settings, watermark presentation, accessibility, and message rendering. Electron owns the desktop window and preload boundary. Capacitor owns Android packaging; it does not change the Worker protocol.

## Security model

The minimal Worker uses one shared secret. This is intentionally narrow and appropriate only for a trusted small group. The next security milestone is a per-agent credential map with authorization rules such as “muse1 may send as muse1” and “muse2 may receive only its own prefix.”

The renderer treats message bodies as untrusted data. It escapes HTML before inserting message content into the inbox. Electron disables Node integration in the renderer and exposes only a small version bridge through the preload script.

## Why not WebSockets yet?

A WebSocket or Durable Object would be justified by sub-second delivery, typing indicators, presence, or bidirectional session state. It would also introduce connection lifecycle, reconnect, heartbeat, and mobile background complexity. The current requirement is dependable small text delivery, so polling is the simpler correct choice.

## Growth boundaries

When message volume exceeds the practical KV prefix scan, add cursor pagination or move inbox indexing to D1. When binary attachments appear, put them in R2 and send signed references. When delivery must wake a sleeping phone, integrate FCM or APNs and keep the Worker as the source of truth.
