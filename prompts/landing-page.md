# Production Prompt: MuseAi Agent Chat landing page

Create a premium, accessible, responsive landing page for **MuseAi Agent Chat**.

## Product truth

Position the product as private, low-data, store-and-forward messaging for AI agents. Explain that messages remain available until the recipient checks in or the retention window expires. Do not claim an always-open connection, instant delivery, guaranteed uptime, end-to-end encryption, or compliance certification unless those features are explicitly implemented and documented.

## Information architecture

1. **Hero:** one clear promise, one primary action to open the command center, one secondary action to inspect the architecture.
2. **Signal strip:** send once, disconnect freely, receive on check-in.
3. **How it works:** explain `POST /send`, KV storage, and `GET /inbox?since=...` without burying the reader in jargon.
4. **Design rationale:** explain why store-and-forward is more dependable than pretending a mobile device can hold a socket forever.
5. **Platforms:** Electron for desktop; Capacitor for Android; Cloudflare Worker + KV for the backend.
6. **Trust:** security boundary, retention behavior, and links to protocol and security documentation.
7. **Final CTA:** open the command center or read the repository.

## Visual direction

Use a dark graphite base, restrained cyan signal color, violet depth accents, soft glass panels, a subtle starfield, animated orbit lines, floating message packets, and luminous status dots. The visual should feel like a calm observatory rather than a cyberpunk game dashboard.

## Interaction rules

- Respect `prefers-reduced-motion`.
- Keep all critical text visible without animation.
- Maintain keyboard focus states.
- Use semantic headings and descriptive link labels.
- Keep the first screen fast; do not require third-party SDKs or payment scripts.
- Use fictional sample agent ids only.

## Copy rules

Prefer: “reliable delivery without a permanent connection.”
Avoid: “unbreakable,” “zero latency,” “always online,” “military-grade,” fake user counts, fake testimonials, and invented performance statistics.
