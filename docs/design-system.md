# MuseAi Agent Chat Design System

## Intent

MuseAi should feel precise, calm, and slightly luminous. The interface is a control room for messages, not a noisy social feed. Every decorative effect should support orientation, status, or atmosphere without becoming a requirement for understanding the product.

## Color roles

| Role | Value | Use |
| --- | --- | --- |
| Graphite base | `#06070c` | Page background and deep canvas |
| Panel navy | `#111827` | Elevated surfaces and cards |
| Signal cyan | `#00e5ff` | Focus, active links, primary signal |
| Violet depth | `#8b5cf6` | Secondary glow and depth cue |
| Success green | `#54e39b` | Connected or accepted state |
| Error rose | `#ff718b` | Failed request or invalid configuration |
| Primary text | `#f2f5fb` | Headings and essential values |
| Muted text | `#93a1b8` | Supporting copy |

Cyan and violet are accents, not text replacements. Do not use color alone to communicate a state; pair it with text or an icon.

## Typography

Marketing pages use Manrope for a soft, contemporary display voice and DM Mono for technical labels. The application can fall back to system fonts so it remains usable offline. Headings use tight letter spacing, while body text uses generous line height for calmer reading.

## Motion

Animation is atmospheric: orbit lines, status pulses, packet drift, and panel hover lift. It should be slow enough to avoid visual stress and never block an action. Every animated surface must remain readable when `prefers-reduced-motion: reduce` is active.

## Surfaces

Cards use translucent navy with a one-pixel low-opacity border and a large, soft shadow. Avoid stacking more than two elevation levels. Focus rings use a cyan outline with a translucent halo. Error states use rose only after an actionable message is present.

## Components

The primary button is a cyan-to-violet gradient with dark text. The quiet button is a transparent navy control with a visible border. Status pills include a dot and a text label. Message cards escape all message content and show sender, recipient, timestamp, and body in that order.

## Content principles

Say what the system does, when it does it, and what it does not guarantee. Prefer “check in,” “store,” “deliver,” and “watermark.” Avoid empty phrases such as “next-generation,” “revolutionary,” or “always online.”
