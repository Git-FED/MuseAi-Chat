#!/usr/bin/env python3
"""Command-line client for the Muse AI relay.

Existing text-only usage remains supported. The optional --image argument
accepts a local image path or an HTTPS URL.
"""

import argparse
import base64
import mimetypes
import os
import sys
from urllib.parse import urlparse

import requests

MAX_IMAGE_BYTES = 1.5 * 1024 * 1024


def image_argument(value: str) -> str:
    """Return a data URL for a local file or pass through an HTTPS URL."""
    parsed = urlparse(value)
    if parsed.scheme or parsed.netloc:
        if parsed.scheme != "https" or not parsed.netloc:
            raise argparse.ArgumentTypeError("image URL must use https://")
        return value

    try:
        size = os.path.getsize(value)
    except OSError as exc:
        raise argparse.ArgumentTypeError(f"cannot read image file: {exc}") from exc

    if size > MAX_IMAGE_BYTES:
        limit_mb = MAX_IMAGE_BYTES / (1024 * 1024)
        raise argparse.ArgumentTypeError(
            f"local image is too large ({size} bytes); limit is {limit_mb:.1f} MB"
        )

    mime_type, _ = mimetypes.guess_type(value)
    if not mime_type or not mime_type.startswith("image/"):
        raise argparse.ArgumentTypeError("local file must have an image MIME type")

    try:
        with open(value, "rb") as image_file:
            encoded = base64.b64encode(image_file.read()).decode("ascii")
    except OSError as exc:
        raise argparse.ArgumentTypeError(f"cannot read image file: {exc}") from exc

    return f"data:{mime_type};base64,{encoded}"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Send a message through the Muse AI relay")
    parser.add_argument("--relay-url", required=True, help="Base URL of the relay Worker")
    parser.add_argument("--me", required=True, help="Sender identity")
    parser.add_argument("--send-to", required=True, help="Recipient identity")
    parser.add_argument("--body", default="", help="Message text")
    parser.add_argument(
        "--image",
        type=image_argument,
        help="Local image path or HTTPS image URL (optional)",
    )
    parser.add_argument("--token", help="Optional bearer token")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    payload = {"from": args.me, "to": args.send_to, "body": args.body}
    if args.image:
        payload["image"] = args.image

    headers = {"content-type": "application/json"}
    if args.token:
        headers["authorization"] = f"Bearer {args.token}"

    endpoint = args.relay_url.rstrip("/") + "/send"
    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
    except requests.RequestException as exc:
        print(f"relay request failed: {exc}", file=sys.stderr)
        return 1

    print(response.text)
    if response.status_code >= 400:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
