# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MarketDay marketing site — an Astro + Tailwind CSS 4 marketing site (no client-side framework islands, no tests). Pages are composed in `src/pages/` from a stack of section components. Almost every page is prerendered; the two exceptions are on-demand routes the Vercel adapter deploys as functions — the form actions (`/_actions/*`, see "Forms" below) and the `/app/*` catch-all (see "Universal links" below).

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

**Page composition**: every route in `src/pages/` (`index`, `about`, `contact`, `delete-account`, `pricing`, `privacy`, `sell-with-us`, `terms`, `vendor-help`, `app/[...path]`) is a thin shell that renders `Layout.astro` wrapping a fixed, page-specific sequence of section components — typically `<Page>Hero` → two or three content sections → `<Page>Cta` → `SiteFooter`. The home page is the one exception where `SiteNav` lives inside `Hero`; every other page renders `SiteNav` directly above its `Hero`. To add or reorder a page's content, edit that page file's stack directly — there's no CMS or content collection layer. `Layout.astro` also takes per-page `title`/`description`/`image`/`ogType`/`noindex` props (falling back to `seo` in `src/data/site.ts`) that drive the `<title>`, meta description, canonical, and Open Graph/Twitter tags; pass `noindex` for transactional or link-gated pages (see `app/[...path].astro`).

**Component layers** (`src/components/`):
- `sections/` — full-width page sections, one per page block, grouped by a `<Page>` prefix (e.g. `AboutHero`, `AboutStory`, `AboutCta`); each is self-contained and imports the `ui/` and `icons/` pieces it needs.
- `ui/` — small reusable presentational pieces (cards, badges, list items) consumed by sections across multiple pages.
- `icons/` — one `.astro` file per SVG icon, each accepting a `class` prop (and sometimes `strokeWidth`) for styling from the caller.
- `layout/` — page chrome (currently `SiteFooter.astro`; nav lives in `sections/SiteNav.astro` since on the home page it's part of the Hero).

**Content/data separation**: Copy and structured content live in `src/data/` as typed TS modules, not hardcoded in components — generally one module per page (`about.ts`, `contact.ts`, `pricing.ts`, `privacy.ts`, `sell-with-us.ts`, `terms.ts`, `vendor-help.ts`, `app-access.ts`) plus:
- `src/data/site.ts` — brand info, nav links, footer columns, legal links, and the site-wide `seo` defaults `Layout.astro` falls back to.
- `src/data/home.ts` — per-section content arrays (steps, features, testimonials, FAQs, vendor benefits), each with a matching `interface`/`type` export.

Components that render one of these arrays typically map an icon-name union (e.g. `StepIcon`, `FeatureIcon`) to an actual icon component via a local lookup object (see `FeatureCard.astro`), rather than importing icons dynamically.

**Styling**: Tailwind CSS 4 via the Vite plugin (`@tailwindcss/vite`), configured in `astro.config.mjs`. There is no `tailwind.config.js` — theme tokens (fonts, brand colors, custom shadows) are defined with `@theme` in `src/styles/global.css`, which also sets `@layer base` defaults for `body` and `a`. Prefer the existing custom tokens (`bg-forest`, `text-clay`, `shadow-card`, etc.) over introducing new ad hoc colors. Tailwind utility classes are used directly in markup; `class:list` is used for conditional classes (see `FeatureCard.astro`).

**Fonts**: Google Fonts (`Bricolage Grotesque` for display/headings, `Hanken Grotesk` for body) are loaded via `<link>` tags in `Layout.astro` and mapped to `--font-display`/`--font-sans` in `global.css`.

**Path conventions**: Imports are relative (no `@/`-style aliases configured in `tsconfig.json`).

## Forms (contact, delete-account, app invite)

The `/contact` and `/delete-account` forms and the test-build invite dialog are the site's only server-side paths. The pages themselves stay prerendered — Astro injects the `/_actions/*` endpoint as on-demand, so only that becomes a Vercel function.

**This site sends no email.** It validates, filters spam, and forwards to the MarketDay API, which owns the templating, the inbox routing and the actual send.

**Flow**: `sections/ContactGrid.astro` → `actions.contact.send(FormData)` → `src/actions/index.ts` → `src/lib/api/contact.ts` → GraphQL mutation on the API. The delete-account form follows the same path through `src/lib/api/delete-account.ts`.

**App invite dialog**: the app isn't listed publicly yet, so a `ui/StoreBadge.astro` rendered without an `href` becomes a button that opens `ui/AppInviteModal.astro` — a native `<dialog>`, rendered once per page, collecting a name and address for the iOS/Android test build. It has no mutation of its own: `src/lib/api/app-invite.ts` composes a fixed message and rides `submitContactMessage`, so requests land in the team inbox with the requester as Reply-To. When the app ships, give the badges real `href`s and the dialog stops being reachable.

**API client** (`src/lib/api/client.ts`): raw `fetch` POST to `API_URL`, no SDK, one operation per document, `AbortSignal.timeout(API_TIMEOUT_MS)` so a slow API can't outlive the function. Every failure — transport, HTTP status, or a `200` carrying GraphQL `errors` — surfaces as `ApiError`.

**Authentication**: the site has no user session, so the only credential is the shared `API_KEY`, sent as `x-api-key` for the API's global `ApiKeyGuard` (`backend/src/common/guards/api-key.guard.ts`) to check. It is a server-only secret. The API leaves its gate open when it has no key configured, so local dev works with `API_KEY` empty; in production the client throws rather than sending unauthenticated.

> The mutation documents in `src/lib/api/contact.ts` (`submitContactMessage`) and `src/lib/api/delete-account.ts` (`requestAccountDeletionLink`) are confirmed against `backend/src/schema.gql` and their resolvers, both of which are `@Public()` since no JWT is available.

**Environment**: variables are declared in the `env.schema` block of `astro.config.mjs` and imported from `astro:env/server`, never `process.env`. Copy `.env.example` to `.env` to get started; every variable has a default.

**Local testing**: run the API (`cd ../backend && pnpm start:dev`) and leave `API_URL` at its default. Use `127.0.0.1`, not `localhost`: `localhost` can resolve to IPv6 `::1`, which Docker Desktop's port forwarding doesn't answer, so the request hangs rather than failing.

## Universal links / app links

Everything under `/app/*` is reserved for links meant to open the MarketDay app (order, market, vendor, invite, and reset-password links). No other route may start with `/app/` — that namespace is what `public/.well-known/apple-app-site-association` and `public/.well-known/assetlinks.json` advertise to iOS and Android, and the mobile app's `associatedDomains`/`intentFilters` (in the sibling `mobile-app` repo's `app.json`) claim the same prefix. If you change the prefix here, it must change in both repos together.

`src/pages/app/[...path].astro` is the fallback for when the link doesn't open the app — desktop browsers, the app not installed, or the link opened before the app has a public store listing. It sets `export const prerender = false` (the site's second on-demand route, after `/_actions/*`) since it has to answer every path under `/app/` without enumerating them. It reuses the existing `StoreBadge`/`AppInviteModal` pairing from the homepage rather than introducing new download UI.

Only `marketday.ie` is claimed, not `www.marketday.ie` — `www` 308-redirects to the apex, and Apple's AASA fetcher refuses a file served through a redirect. The root `vercel.json` exists solely to set `Content-Type: application/json` on the extensionless AASA file; Vercel can't infer a type for a file with no extension, and both Apple's validator and Android's verifier expect JSON. Don't add other config to it without checking it doesn't conflict with `@astrojs/vercel`'s generated `.vercel/output/config.json` (e.g. a `trailingSlash` mismatch fails the build).

The AASA's `appIDs` entry needs the Apple Team ID prefixed to the bundle ID, and `assetlinks.json` needs the Android signing certificate's SHA-256 fingerprint — neither lives in this repo (EAS-managed credentials); see the placeholders in both files for where to fetch them from.

### Security invariants

Changing any of these needs care — each one is load-bearing:

- **Never put raw input in a header.** `sanitizeHeaderValue()` strips CR/LF, which is the payload for email header injection. The subject only becomes a real header inside the API, but it is stripped at this edge so a bug down there can't become a vulnerability.
- **Normalise, then re-check.** `normalizeText()` strips control, zero-width, and bidi-override characters ("Trojan Source"). Length limits are enforced *before* normalisation, and required fields are re-checked *after* — otherwise input made entirely of invisible characters passes validation and arrives empty.
- **Spam gates fail silently.** The honeypot, fill-time, and link-count checks return the same `{ ok: true }` a real submission gets, and log the reason server-side. Returning an error would just tell a bot what to change.
- **Never echo input back to the browser.** Status messages are static strings set via `textContent`. `ApiError` messages can carry API detail, so they are logged and replaced with a generic message.
- **`security.checkOrigin`** is pinned `true` in `astro.config.mjs`; it is what rejects cross-site POSTs to the action.

Rate limiting (`src/lib/security/rate-limit.ts`) is per-IP and in-process, so it is best-effort across serverless instances. It caps abuse from one warm instance; the honeypot and timing checks are the real bot gates. Swap in Upstash/Vercel KV if an exact limit is ever needed.
