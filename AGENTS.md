# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MarketDay marketing site — an Astro + Tailwind CSS 4 marketing site (no client-side framework islands, no tests). Pages are composed in `src/pages/` from a stack of section components. Every page is prerendered; the only server-side code is the form actions (see below), which the Vercel adapter deploys as a single function.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`).

```
pnpm install          # install dependencies
cp .env.example .env   # local config (all values have defaults; see "Forms")
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

## Forms (contact, delete-account)

The `/contact` and `/delete-account` forms are the site's only server-side paths. The pages themselves stay prerendered — Astro injects the `/_actions/*` endpoint as on-demand, so only that becomes a Vercel function.

**This site sends no email.** It validates, filters spam, and forwards to the MarketDay API, which owns the templating, the inbox routing and the actual send.

**Flow**: `sections/ContactGrid.astro` → `actions.contact.send(FormData)` → `src/actions/index.ts` → `src/lib/api/contact.ts` → GraphQL mutation on the API. The delete-account form follows the same path through `src/lib/api/delete-account.ts`.

**API client** (`src/lib/api/client.ts`): raw `fetch` POST to `API_URL`, no SDK, one operation per document, `AbortSignal.timeout(API_TIMEOUT_MS)` so a slow API can't outlive the function. Every failure — transport, HTTP status, or a `200` carrying GraphQL `errors` — surfaces as `ApiError`.

**Authentication**: the site has no user session, so the only credential is the shared `API_KEY`, sent as `x-api-key` for the API's global `ApiKeyGuard` (`backend/src/common/guards/api-key.guard.ts`) to check. It is a server-only secret. The API leaves its gate open when it has no key configured, so local dev works with `API_KEY` empty; in production the client throws rather than sending unauthenticated.

> The mutation documents in `src/lib/api/contact.ts` and `src/lib/api/delete-account.ts` are placeholders pending the API-side resolvers — operation names and input types still need confirming against `backend/src/schema.gql`. Both mutations must be `@Public()` there, since no JWT is available.

**Environment**: variables are declared in the `env.schema` block of `astro.config.mjs` and imported from `astro:env/server`, never `process.env`. Copy `.env.example` to `.env` to get started; every variable has a default.

**Local testing**: run the API (`cd ../backend && pnpm start:dev`) and leave `API_URL` at its default. Use `127.0.0.1`, not `localhost`: `localhost` can resolve to IPv6 `::1`, which Docker Desktop's port forwarding doesn't answer, so the request hangs rather than failing.

### Security invariants

Changing any of these needs care — each one is load-bearing:

- **Never put raw input in a header.** `sanitizeHeaderValue()` strips CR/LF, which is the payload for email header injection. The subject only becomes a real header inside the API, but it is stripped at this edge so a bug down there can't become a vulnerability.
- **Normalise, then re-check.** `normalizeText()` strips control, zero-width, and bidi-override characters ("Trojan Source"). Length limits are enforced *before* normalisation, and required fields are re-checked *after* — otherwise input made entirely of invisible characters passes validation and arrives empty.
- **Spam gates fail silently.** The honeypot, fill-time, and link-count checks return the same `{ ok: true }` a real submission gets, and log the reason server-side. Returning an error would just tell a bot what to change.
- **Never echo input back to the browser.** Status messages are static strings set via `textContent`. `ApiError` messages can carry API detail, so they are logged and replaced with a generic message.
- **`security.checkOrigin`** is pinned `true` in `astro.config.mjs`; it is what rejects cross-site POSTs to the action.

Rate limiting (`src/lib/security/rate-limit.ts`) is per-IP and in-process, so it is best-effort across serverless instances. It caps abuse from one warm instance; the honeypot and timing checks are the real bot gates. Swap in Upstash/Vercel KV if an exact limit is ever needed.
