# MuseAi Prompt Library

The `prompts/` directory contains versioned creative and editorial specifications for the MuseAi Agent Chat project. These documents are inputs for future design or writing work; they are not executable runtime instructions and never contain credentials.

## Prompt roles

`landing-page.md` defines the public marketing page. It protects the product promise from becoming exaggerated while still allowing a rich visual treatment.

`github-page.md` defines the technical project overview and the information required for contributors to build and operate the repository.

`social-preview.md` defines the 1280×640 preview asset, including safe margins, hierarchy, and visual exclusions.

`support-page.md` defines an adult-oriented support-page presentation gate with explicit placeholder and compliance boundaries. It must not be used to invent payment links, prices, provider approvals, or legal claims.

## Prompt revision rules

When the product changes, update the relevant prompt and the implementation together. Keep the brand name exactly **MuseAi Agent Chat**. Use the product’s honest phrase, **reliable delivery without a permanent connection**, instead of claiming a live connection the system does not maintain.

Before publishing generated copy, check every product name, endpoint, environment variable, promise, and link against the repository. Never let a generated prompt create a secret, a real payment credential, a fake testimonial, or a made-up performance number.
