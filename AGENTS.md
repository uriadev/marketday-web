# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MarketDay marketing site — a single-page Astro + Tailwind CSS 4 landing page (no backend, no client-side framework islands, no tests). The entire site is composed on `src/pages/index.astro` from a stack of section components.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`).

```
pnpm install          # install dependencies
pnpm dev               # start dev server at localhost:4321
pnpm build             # production build to ./dist/
pnpm preview           # preview the production build locally
pnpm astro check       # type-check .astro files
```

When starting the dev server, use background mode so it doesn't block:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

There is no lint or test setup in this repo — don't add one unless asked.

### Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Architecture

**Page composition**: `src/pages/index.astro` renders `Layout.astro` wrapping a fixed sequence of section components (`Hero` → `HowItWorks` → `WhyMarketDay` → `Testimonials` → `ForVendors` → `Faq` → `FinalCta` → `SiteFooter`). To add or reorder site content, edit that stack directly — there's no CMS or content collection layer.

**Component layers** (`src/components/`):
- `sections/` — full-width page sections (one per home-page block), each self-contained and importing the `ui/` and `icons/` pieces it needs.
- `ui/` — small reusable presentational pieces (cards, badges, list items) consumed by sections.
- `icons/` — one `.astro` file per SVG icon, each accepting a `class` prop (and sometimes `strokeWidth`) for styling from the caller.
- `layout/` — page chrome (currently `SiteFooter.astro`; nav lives in `sections/SiteNav.astro` since it's part of the Hero).

**Content/data separation**: Copy and structured content live in `src/data/` as typed TS modules, not hardcoded in components:
- `src/data/site.ts` — brand info, nav links, footer columns, legal links.
- `src/data/home.ts` — per-section content arrays (steps, features, testimonials, FAQs, vendor benefits), each with a matching `interface`/`type` export.

Components that render one of these arrays typically map an icon-name union (e.g. `StepIcon`, `FeatureIcon`) to an actual icon component via a local lookup object (see `FeatureCard.astro`), rather than importing icons dynamically.

**Styling**: Tailwind CSS 4 via the Vite plugin (`@tailwindcss/vite`), configured in `astro.config.mjs`. There is no `tailwind.config.js` — theme tokens (fonts, brand colors, custom shadows) are defined with `@theme` in `src/styles/global.css`, which also sets `@layer base` defaults for `body` and `a`. Prefer the existing custom tokens (`bg-forest`, `text-clay`, `shadow-card`, etc.) over introducing new ad hoc colors. Tailwind utility classes are used directly in markup; `class:list` is used for conditional classes (see `FeatureCard.astro`).

**Fonts**: Google Fonts (`Bricolage Grotesque` for display/headings, `Hanken Grotesk` for body) are loaded via `<link>` tags in `Layout.astro` and mapped to `--font-display`/`--font-sans` in `global.css`.

**Path conventions**: Imports are relative (no `@/`-style aliases configured in `tsconfig.json`).
