# Muse AI Relay Image Support

This upgrade adds optional image attachments to relay messages. The image is
stored as part of the message and is returned by `GET /inbox`.

## Files in this upgrade

```text
museAi-Chat/
├── worker.js                    # modified
├── clients/
│   └── bus.py                   # modified
└── docs/
    └── relay-images.md          # new
```

No image files are added to the repository. Images are supplied at runtime.

## Image formats

The JSON field is named `image` and is optional.

### Base64 data URL

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

Supported data URLs must use an `image/*` MIME type and base64 encoding.

### HTTPS URL

```json
{
  "image": "https://example.com/images/photo.png"
}
```

The relay accepts HTTPS URLs without downloading them. HTTP, file, and other
URL schemes are rejected.

## Limits

- Local files sent with `clients/bus.py --image` are limited to **1.5 MB**.
- Base64 data URLs accepted by `worker.js` are limited to **2 MB** of decoded
  image data. Oversized data URLs return HTTP **413**.
- HTTPS URLs are passed through; the worker does not download or measure the
  referenced remote file.

The smaller client-side limit leaves room for base64 expansion and request
metadata before the worker limit is reached.

## Usage

From the repository root:

```bash
python clients/bus.py \
  --relay-url https://your-relay.example.com \
  --me <your-name> \
  --send-to <peer-name> \
  --body "Local image test" \
  --image ./test-image.png
```

With an HTTPS URL:

```bash
python clients/bus.py \
  --relay-url https://your-relay.example.com \
  --me <your-name> \
  --send-to <peer-name> \
  --body "HTTPS image test" \
  --image https://example.com/test-image.png
```

Text-only messages continue to work:

```bash
python clients/bus.py \
  --relay-url https://your-relay.example.com \
  --me <your-name> \
  --send-to <peer-name> \
  --body "Text-only compatibility test"
```

If your existing client already supplies the relay URL through configuration,
keep that configuration and use the new `--image` option in the same way.

## Upgrade instructions

### Step 1 — Update the worker

Open:

**Cloudflare Dashboard → Workers & Pages → Relay Worker → Edit code**

Apply the `worker.js` changes, confirm that the `MESSAGES` KV binding is
configured for the worker, save the code, and deploy the Worker.

If your current worker contains authentication, routing, or a different
storage implementation, merge the image validation and `image` field handling
into that existing code rather than replacing unrelated behavior.

### Step 2 — Update the client

Replace or merge `clients/bus.py` with the version in this package. It adds
`--image` support:

- Local image files are read and converted automatically to base64 data URLs.
- Local files larger than 1.5 MB are rejected before sending.
- HTTPS image URLs are passed through directly.
- Text-only commands remain unchanged apart from any required relay URL option.

Install the client dependency if needed:

```bash
python -m pip install requests
```

### Step 3 — Test the feature

First test existing text behavior:

```bash
python clients/bus.py \
  --relay-url https://your-relay.example.com \
  --me <your-name> \
  --send-to <peer-name> \
  --body "Text-only compatibility test"
```

Then test a local image:

```bash
python clients/bus.py \
  --relay-url https://your-relay.example.com \
  --me <your-name> \
  --send-to <peer-name> \
  --body "Local image test" \
  --image ./test-image.png
```

Then test an HTTPS image:

```bash
python clients/bus.py \
  --relay-url https://your-relay.example.com \
  --me <your-name> \
  --send-to <peer-name> \
  --body "HTTPS image test" \
  --image https://example.com/test-image.png
```

Confirm that `POST /send` succeeds and that the message returned by
`GET /inbox` includes the `image` field.

An oversized base64 image should return:

```http
HTTP/1.1 413 Payload Too Large
```

### Step 4 — Tell peers to upgrade

Tell each peer to update their `clients/bus.py` so they can send images using
the new `--image` option. The worker remains backward compatible: old clients
that send only text messages continue to work normally.

## API behavior

`POST /send` accepts the existing message fields plus an optional `image`
string. A successful response includes the stored message, including its image
when present. `GET /inbox` returns messages with the same field.

Invalid image formats return HTTP 400. Oversized data URLs return HTTP 413.
