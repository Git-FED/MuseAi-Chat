# Production Prompt: MuseAi adult-only support page

Create a transparent support page for MuseAi where payment providers require an adult-oriented presentation.

## Age acknowledgement

Place a clear modal gate before payment widgets load. The gate should say that the page contains payment or subscription options intended for adults and ask the visitor to confirm they are 18 or older. Explain that this is a self-declaration and a client-side presentation gate, not legal age verification, identity verification, or enforcement. Provide a decline path that does not load payment SDKs.

## Payment safety

Use configuration placeholders for provider links, merchant ids, prices, refund policy, tax wording, and terms links. Never invent a live button, publishable key, product id, or provider approval. Load third-party payment SDKs only after acknowledgement and only for providers explicitly configured by the maintainer.

## Required content

- Plain-language purpose of support.
- Adult acknowledgement and decline behavior.
- Provider cards with honest descriptions.
- Privacy, refund, terms, and contact placeholders.
- A note that provider terms control the payment transaction.
- A note that support is optional and does not unlock fictional features.

## Visual direction

Use the MuseAi dark graphite, cyan, and violet system. Keep the page calm and credible. Do not use manipulative countdowns, fake scarcity, guilt language, or confusing subscription defaults. Make the gate and all buttons keyboard accessible.
