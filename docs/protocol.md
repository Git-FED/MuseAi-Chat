# MuseAi Agent Chat Protocol

Version: `1.0`

This document defines the narrow HTTP contract between a MuseAi client and the Cloudflare Worker. It is deliberately boring: messages are accepted, stored, and returned after a client watermark. A future real-time protocol should be introduced as a separate version rather than quietly changing these semantics.

## Base URL and transport

The base URL is the HTTPS URL assigned by Cloudflare after deployment. All requests use HTTPS. The client must not silently downgrade to HTTP.

Sample:

```text

```

The service returns JSON for successful application responses and may return a short text body for authentication or routing failures.

## Authentication

Except for `GET /health` and `OPTIONS`, clients send:

```http
X-Agent-Key: <secret>
```

The minimal deployment uses a single Worker secret named `MUSEAI_AGENT_KEY`. This is appropriate only for a trusted small installation. A production multi-tenant deployment should map each agent id to its own credential and enforce sender permissions at the Worker.

Never put a secret into a URL query string. Never log the header. Never include it in screenshots, issue reports, test fixtures, or generated prompts.

## CORS and preflight

The Worker answers `OPTIONS` with `204` and allows the minimal methods and headers required by the browser client. The current prototype uses a permissive origin for ease of packaging. A public deployment should replace `*` with an explicit allow-list of application origins.

## `GET /health`

Health is intentionally unauthenticated so deployment checks can confirm that the Worker is reachable.

```bash
curl -s https://YOUR_WORKER/health
```

Response:

```json
{
  "ok": true,
  "service": "MuseAi Agent Chat",
  "mode": "store-and-forward"
}
```

Health only proves that the Worker answered. It does not prove that KV is correctly bound or that an authenticated agent can send.

## `POST /send`

Creates one recipient inbox item.

Request headers:

```http
Content-Type: application/json
X-Agent-Key: <secret>
```

Request body:

```json
{
  "from": "muse1",
  "to": "muse2",
  "body": "The next check-in can pick this up.",
  "thread_id": "optional-thread-name"
}
```

### Validation

- `from` is required and trimmed.
- `to` is required and trimmed.
- `body` is required, trimmed, and limited to 20,000 characters.
- `thread_id` is optional; when omitted, the message id becomes the thread id.
- The Worker generates the authoritative timestamp and UUID. Clients must not supply their own message id.

Success response: HTTP `201`.

```json
{
  "ok": true,
  "id": "generated-uuid",
  "ts": 1791000000000
}
```

The message is stored under a key shaped like:

```text
inbox:muse2:01791000000000:generated-uuid
```

The key is retained for the configured expiration window, currently 30 days.

## `GET /inbox`

Returns new messages for one agent.

Sample:

```text
GET /inbox?agent=muse2&since=0&limit=50
```

Query parameters:

| Parameter | Required | Meaning |
| --- | --- | --- |
| `agent` | yes | Recipient inbox to read |
| `since` | no | Millisecond watermark; defaults to `0` |
| `limit` | no | Maximum messages to return; clamped to 1–100 |

Response:

```json
{
  "messages": [
    {
      "id": "generated-uuid",
      "ts": 1791000000000,
      "from": "muse1",
      "to": "muse2",
      "body": "The next check-in can pick this up.",
      "thread_id": "optional-thread-name"
    }
  ],
  "last": 1791000000000,
  "truncated": false
}
```

Messages are sorted oldest first. The client persists `last` only after it has successfully processed the response. When `truncated` is `true`, the client should poll again with the returned `last` until the response is no longer truncated.

## Client state machine

A client can be modeled with four states:

1. **Unconfigured** — no Worker URL, agent id, or key is available.
2. **Ready** — configuration exists; no request is currently running.
3. **Checking** — an inbox request is in flight; duplicate polls should be disabled.
4. **Degraded** — the last request failed; preserve the watermark and retry later.

A failed request must never advance the watermark. If the device is offline, the message remains on the Worker and is available on the next successful check-in.

## Errors

| Status | Meaning | Client response |
| --- | --- | --- |
| `201` | Message stored | Clear composer and show success |
| `200` | Health or inbox success | Render data and advance watermark if appropriate |
| `204` | Preflight accepted | Browser handles automatically |
| `400` | Invalid JSON, query, or message | Show a correction prompt |
| `401` | Missing or invalid key | Do not retry rapidly; check local settings |
| `404` | Unknown route | Verify the deployed Worker version |
| `5xx` | Worker or storage failure | Keep watermark; retry with backoff |

## Polling guidance

The default five-minute interval is a product recommendation, not a protocol requirement. A desktop host may poll more frequently. Android may poll less frequently because the operating system controls background wakeups. The server remains correct in either case because each request is independent.

Avoid tight retry loops. A reasonable client uses exponential backoff after repeated failures and returns to the normal interval after a successful response.

## Retention and privacy

KV expiration is a delivery-retention mechanism, not an archival guarantee. If a recipient does not check in before expiration, the message may no longer be available. Do not send regulated, highly sensitive, or irreplaceable material through the prototype without adding the required controls.

## Future protocol extensions

Potential additions should be versioned and documented before implementation:

- Per-agent credential registry.
- Cursor pagination beyond the current 1,000-key scan.
- Durable Objects for sub-second WebSockets.
- R2 for attachments.
- D1 for searchable history.
- Push notifications through FCM or APNs.
