# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MarketDay marketing site — an Astro + Tailwind CSS 4 marketing site (no client-side framework islands, no tests). Pages are composed in `src/pages/` from a stack of section components. Almost every page is prerendered; the exceptions are on-demand routes the Vercel adapter deploys as functions — the form actions (`/_actions/*`, see "Forms" below), the `/app/*` catch-all (see "Universal links" below), `/markets`, which reads its list from the API (see "Market finder" below), and the signed-in vendor portal under `/vendor/*` (see "Vendor portal" below).

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

**Page composition**: every route in `src/pages/` (`index`, `about`, `contact`, `delete-account`, `markets`, `pricing`, `privacy`, `sell-with-us`, `terms`, `vendor-help`, `app/[...path]`) is a thin shell that renders `Layout.astro` wrapping a fixed, page-specific sequence of section components — typically `<Page>Hero` → two or three content sections → `<Page>Cta` → `SiteFooter`. The home page is the one exception where `SiteNav` lives inside `Hero`; every other page renders `SiteNav` directly above its `Hero`. To add or reorder a page's content, edit that page file's stack directly — there's no CMS or content collection layer. `Layout.astro` also takes per-page `title`/`description`/`image`/`ogType`/`noindex` props (falling back to `seo` in `src/data/site.ts`) that drive the `<title>`, meta description, canonical, and Open Graph/Twitter tags; pass `noindex` for transactional or link-gated pages (see `app/[...path].astro`). The vendor portal's pages (`vendor/*`) are the exception to the shell: they render `layouts/VendorPortalLayout.astro`, which wraps `Layout` with the nav, the portal header, the footer and the portal's shared dialog/status UI.

**Component layers** (`src/components/`):
- `sections/` — full-width page sections, one per page block, grouped by a `<Page>` prefix (e.g. `AboutHero`, `AboutStory`, `AboutCta`); each is self-contained and imports the `ui/` and `icons/` pieces it needs.
- `ui/` — small reusable presentational pieces (cards, badges, list items) consumed by sections across multiple pages.
- `icons/` — one `.astro` file per SVG icon, each accepting a `class` prop (and sometimes `strokeWidth`) for styling from the caller.
- `layout/` — page chrome (currently `SiteFooter.astro`; nav lives in `sections/SiteNav.astro` since on the home page it's part of the Hero).

**Content/data separation**: Copy and structured content live in `src/data/` as typed TS modules, not hardcoded in components — generally one module per page (`about.ts`, `contact.ts`, `markets.ts`, `pricing.ts`, `privacy.ts`, `sell-with-us.ts`, `terms.ts`, `vendor-help.ts`, `app-access.ts`, `vendor-portal.ts`) plus:
- `src/data/site.ts` — brand info, nav links, footer columns, legal links, and the site-wide `seo` defaults `Layout.astro` falls back to.
- `src/data/home.ts` — per-section content arrays (steps, features, testimonials, FAQs, vendor benefits), each with a matching `interface`/`type` export.

Components that render one of these arrays typically map an icon-name union (e.g. `StepIcon`, `FeatureIcon`) to an actual icon component via a local lookup object (see `FeatureCard.astro`), rather than importing icons dynamically.

**Market finder** (`/markets`): the market list comes from the API's public `markets(isActive: true)` query, which only ever returns published markets. The page is on-demand (`prerender = false`), so a market published in the admin console shows up without a redeploy.
- **Caching:** it sets `Cache-Control: s-maxage=300, stale-while-revalidate=600`, so Vercel's CDN serves it and the API sees about one request per cache window. If the API fails, the page logs the `ApiError`, renders a static "couldn't load" state, and is cached for only 30s.
- **Mapping:** `src/lib/api/markets.ts` fetches and maps the API shape onto `Market` (`src/data/markets.ts`, which now holds only the type, the reference point, and the summary helper). It reads GeoJSON `[lng, lat]`, and uses `rrule` to turn the iCal `schedule` + `duration` into days, cadence, hours and upcoming dates.
- **Schedule times:** the API stores Irish wall-clock numerals as UTC, so dates are read with UTC accessors and never converted. A row the page can't place is skipped and logged.
- **rrule is server-only**, and `vite.ssr.noExternal` bundles it because its CommonJS `main` breaks named imports under Node.
- **Client script:** the `<script>` in `sections/MarketsDirectory.astro` only filters, reorders and relabels the server-rendered cards. It reads the search field and day buttons in `MarketsHero`/`MarketsFilters`, and card data, through `data-*` attributes. Helpers it needs (distance, Dublin date, weekday names) live in `src/lib/markets.ts`, which must not import `rrule` or images.
- **Day tags** (Today / Tomorrow / Trading now) are computed in the browser against Europe/Dublin time from each card's `data-dates`, not its weekday, so fortnightly and monthly markets tag correctly.
- **Location:** "Use my location" uses the browser Geolocation API only and sends nothing anywhere.
- **Map:** `ui/MarketMap.astro` is an SVG schematic plotted from each market's coordinates, not a tile map.
- **Photos:** market photos are remote (`catalog.marketday.ie`, allowlisted in `image.domains`), with `assets/marketday/market-1.png` as the fallback.
- **`API_URL`** is a public server variable, so it is inlined at build time. Set it before building, not only at runtime.

**Styling**: Tailwind CSS 4 via the Vite plugin (`@tailwindcss/vite`), configured in `astro.config.mjs`. There is no `tailwind.config.js` — theme tokens (fonts, brand colors, custom shadows) are defined with `@theme` in `src/styles/global.css`, which also sets `@layer base` defaults for `body` and `a`. Prefer the existing custom tokens (`bg-forest`, `text-clay`, `shadow-card`, etc.) over introducing new ad hoc colors. Tailwind utility classes are used directly in markup; `class:list` is used for conditional classes (see `FeatureCard.astro`).

**Fonts**: Google Fonts (`Bricolage Grotesque` for display/headings, `Hanken Grotesk` for body) are loaded via `<link>` tags in `Layout.astro` and mapped to `--font-display`/`--font-sans` in `global.css`.

**Path conventions**: Imports are relative (no `@/`-style aliases configured in `tsconfig.json`).

## Forms (contact, delete-account, app invite)

The `/contact` and `/delete-account` forms and the test-build invite dialog are the site's only anonymous server-side writes (the vendor portal's are signed in — see "Vendor portal"). The pages themselves stay prerendered — Astro injects the `/_actions/*` endpoint as on-demand, so only that becomes a Vercel function.

**This site sends no email.** It validates, filters spam, and forwards to the MarketDay API, which owns the templating, the inbox routing and the actual send.

**Flow**: `sections/ContactGrid.astro` → `actions.contact.send(FormData)` → `src/actions/index.ts` → `src/lib/api/contact.ts` → GraphQL mutation on the API. The delete-account form follows the same path through `src/lib/api/delete-account.ts`.

**App invite dialog**: store listings live in `storeLinks` (`src/data/site.ts`) — both the App Store and Google Play are live, so no badge currently opens the dialog. A `ui/StoreBadge.astro` with no `href` (and no `storeLinks` entry for its store) becomes a button that opens `ui/AppInviteModal.astro` — a native `<dialog>`, rendered once per page, collecting a name and address for the iOS/Android test build. It has no mutation of its own: `src/lib/api/app-invite.ts` composes a fixed message and rides `submitContactMessage`, so requests land in the team inbox with the requester as Reply-To. It stays wired up for any store left `undefined` in `storeLinks`.

**API client** (`src/lib/api/client.ts`): raw `fetch` POST to `API_URL`, no SDK, one operation per document, `AbortSignal.timeout(API_TIMEOUT_MS)` so a slow API can't outlive the function. Every failure — transport, HTTP status, or a `200` carrying GraphQL `errors` — surfaces as `ApiError`. Three subclasses matter to callers:
- `GraphQLBusinessError`: a `200` carrying `errors`. The resolver's own sentence, safe to show.
- `GraphQLAuthError`: a 401/403 carrying `errors`. The API's auth refusals are a contract meant to be shown, like the lockout countdown. API-key rejections are deliberately kept a plain `ApiError`.
- `ApiOperationUnavailable`: `GRAPHQL_VALIDATION_FAILED`, i.e. the running API doesn't have the field yet. Never shown.

**Authentication**: the public pages have no user session, so their only credential is the shared `API_KEY`, sent as `x-api-key` for the API's global `ApiKeyGuard` (`backend/src/common/guards/api-key.guard.ts`) to check. It is a server-only secret. The API leaves its gate open when it has no key configured, so local dev works with `API_KEY` empty; in production the client throws rather than sending unauthenticated. Vendor-portal calls add the owner's JWT as `accessToken` (sent as `Authorization: Bearer`) on top of the key.

> The mutation documents in `src/lib/api/contact.ts` (`submitContactMessage`) and `src/lib/api/delete-account.ts` (`requestAccountDeletionLink`) are confirmed against `backend/src/schema.gql` and their resolvers, both of which are `@Public()` since no JWT is available.

**Environment**: variables are declared in the `env.schema` block of `astro.config.mjs` and imported from `astro:env/server` (or `astro:env/client` for the one browser-visible value, `PUBLIC_GOOGLE_CLIENT_ID`), never `process.env`. Copy `.env.example` to `.env` to get started; every variable has a default.

**Local testing**: run the API (`cd ../backend && pnpm start:dev`) and leave `API_URL` at its default. Use `127.0.0.1`, not `localhost`: `localhost` can resolve to IPv6 `::1`, which Docker Desktop's port forwarding doesn't answer, so the request hangs rather than failing.

## Vendor portal (`/vendor/*`)

A vendor's **owner** signs in to manage the subscription, see and pay bills, and manage staff. Pages: `/vendor/login`, `/vendor/forgot-password`, `/vendor/billing`, `/vendor/team`, with `/vendor` redirecting to billing. All are `prerender = false` and `noindex`. The API's trial emails link to `/vendor/billing`, so that path is a contract with the backend.

**Owners only.** Every subscription and team operation is owner-only on the API. A STAFF, BUYER or ADMIN sign-in is logged straight back out (no cookie is ever set) and told why. `googleAuth` creates a BUYER for an unknown email, which then gets the "not linked" message.

**Session** (`src/lib/auth/`): the API is header-only (JWT `Authorization: Bearer`, CORS without credentials), so every call goes from this site's server.
- **Cookies.** The API's access and refresh tokens live in two httpOnly cookies (`cookies.ts`). They are `SameSite=Lax` (not `Strict`, so the email link arrives signed in) and `path=/` (actions live under `/_actions`). In production they get the `__Host-` prefix and `Secure`. `maxAge` comes from each JWT's `exp`.
- **No session store.** Vercel has none built in.
- **Refresh** (`session.ts` → `currentAccessToken`): the access token is refreshed 60s before it expires. `withVendorAuth` retries once after a 401. A 403 is never retried.
- **A refused refresh leaves the cookies alone.** The API rotates refresh tokens and lets exactly one of two racing refreshes win. The loser must not delete the winner's fresh cookies, so it only redirects to sign-in, which reads them and bounces straight back.
- **Signing in or out.** Sign-in overwrites the cookies and sign-out clears them. Signing in here never signs the app out: the API's sessions are per device.

**Middleware** (`src/middleware.ts`) runs on `/vendor/*` only, skipping prerendered requests:
- It resolves the session with one `me` call and stores it in `Astro.locals.vendorPortal`: `signed-in`, `signed-out`, or `unavailable` when the API is down.
- It redirects signed-out visitors to `/vendor/login?next=…`, and signed-in ones away from the sign-in pages.
- It sets `Cache-Control: private, no-store` and `X-Robots-Tag` on every portal response.
- Actions don't pass through it. Each one calls `withVendorAuth` itself.

**Forms** (`ui/PortalForm.astro`): every signed-in change is a `<PortalForm portalAction="…">`, and its one script binds every such form on the page.
- **Actions.** The allowlisted action map lives in that script. The actions are `vendor.*`, `vendorTeam.*` and `vendorBilling.*` in `src/actions/vendor-portal.ts`.
- **Success.** A result carrying `{ url }` (Stripe) or `{ redirect }` navigates there. Otherwise the page reloads with `?done=<key>`, and the layout shows the matching allowlisted notice from `portalNotices` in `src/data/vendor-portal.ts`.
- **Error codes.** `UNAUTHORIZED` means "no session" and sends the browser to sign in, so a wrong password is `BAD_REQUEST`, never `UNAUTHORIZED`.
- **Other scripts.** Password reset (`sections/VendorPasswordReset.astro`) and Google sign-in (`ui/GoogleSignInButton.astro`) have their own scripts.

**Google sign-in** uses Google Identity Services in popup mode. The callback posts the ID token to `actions.vendor.googleSignIn`. Redirect mode is a cross-site form POST that `checkOrigin` refuses. `PUBLIC_GOOGLE_CLIENT_ID` must be the backend's `GOOGLE_CLIENT_ID` (the web client), with this site's origins in its Authorized JavaScript origins. Unset, the button is hidden.

**Billing.** `myVendorSubscription` is live. Everything that takes money is the **Billing API contract**, proposed and not yet on the API.
- **The contract.** It is canonical in the header of `src/lib/api/vendor-billing.ts`: `vendorBillingPlan`, `myVendorInvoices`, `startVendorCheckout`, `openVendorBillingPortal`, `changeVendorMarketSlots`.
- **Payments are Stripe-hosted.** Checkout subscribes, the customer portal handles card and cancellation, and invoices link to Stripe's hosted page and PDF. Card data never touches this site.
- **Return URLs are built by the API**, from its `WEB_APP_URL`, never passed from here.
- **Graceful fallback.** Each page read is its own request (`portalRead`), so an operation the API lacks yields `missing` rather than failing the page. The billing page then shows "online payments are coming soon".
- **Prices come from the API, never hardcoded.** `src/data/pricing.ts` is marketing copy and predates the per-market pricing.

**Team** uses the API's `vendorMembers` / `pendingVendorInvites` / `myVendorMarkets` and the invite/revoke/move/remove mutations (`src/lib/api/vendor-team.ts`). The invitee redeems the emailed code in the app, not here.

**Local testing:** the backend's seed (`cd ../backend && pnpm seed run`) creates owners `vendor.<m>.<v>@test.ie` and staff `staff.<m>.<v>@test.ie` (password `1234`), and a buyer `customer@test.ie`. Local mail goes to the SMTP catcher on port 1025.

## Universal links / app links

Everything under `/app/*` is reserved for links meant to open the MarketDay app (order, market, vendor, invite, and reset-password links). No other route may start with `/app/` — that namespace is what `public/.well-known/apple-app-site-association` and `public/.well-known/assetlinks.json` advertise to iOS and Android, and the mobile app's `associatedDomains`/`intentFilters` (in the sibling `mobile-app` repo's `app.json`) claim the same prefix. If you change the prefix here, it must change in both repos together.

`src/pages/app/[...path].astro` is the fallback for when the link doesn't open the app — desktop browsers, the app not installed, or the link opened before the app has a public store listing. It sets `export const prerender = false` (like `/_actions/*` and `/markets`) since it has to answer every path under `/app/` without enumerating them. It reuses the existing `StoreBadge`/`AppInviteModal` pairing from the homepage rather than introducing new download UI.

Only `marketday.ie` is claimed, not `www.marketday.ie` — `www` 308-redirects to the apex, and Apple's AASA fetcher refuses a file served through a redirect. The root `vercel.json` exists solely to set `Content-Type: application/json` on the extensionless AASA file; Vercel can't infer a type for a file with no extension, and both Apple's validator and Android's verifier expect JSON. Don't add other config to it without checking it doesn't conflict with `@astrojs/vercel`'s generated `.vercel/output/config.json` (e.g. a `trailingSlash` mismatch fails the build).

The AASA's `appIDs` entry needs the Apple Team ID prefixed to the bundle ID, and `assetlinks.json` needs the Android signing certificate's SHA-256 fingerprint — neither lives in this repo (EAS-managed credentials); see the placeholders in both files for where to fetch them from.

### Security invariants

Changing any of these needs care — each one is load-bearing:

- **Never put raw input in a header.** `sanitizeHeaderValue()` strips CR/LF, which is the payload for email header injection. The subject only becomes a real header inside the API, but it is stripped at this edge so a bug down there can't become a vulnerability.
- **Normalise, then re-check.** `normalizeText()` strips control, zero-width, and bidi-override characters ("Trojan Source"). Length limits are enforced *before* normalisation, and required fields are re-checked *after* — otherwise input made entirely of invisible characters passes validation and arrives empty.
- **Spam gates fail silently.** The honeypot, fill-time, and link-count checks return the same `{ ok: true }` a real submission gets, and log the reason server-side. Returning an error would just tell a bot what to change.
- **Never echo input back to the browser.** Status messages are static strings set via `textContent`. `ApiError` messages can carry API detail, so they are logged and replaced with a generic message.
- **`security.checkOrigin`** is pinned `true` in `astro.config.mjs`; it is what rejects cross-site POSTs to the action.
- **Vendor portal redirects are allowlisted** (`src/lib/security/redirects.ts`). `safeNextPath` accepts only a `/vendor/…` path (no `//`, no backslash, no control characters). `isStripeUrl` gates every URL the portal redirects to or links, including checkout, the customer portal and invoice links: https on a Stripe host only.
- **Portal tokens never leave the server.** Both JWTs are httpOnly cookies and are forwarded only from the server. Never expose them to `astro:env/client`, markup, or a client script.
- **Never forward `ApiOperationUnavailable`**, which names schema fields. Portal actions forward only `GraphQLBusinessError` and `GraphQLAuthError` details.

Rate limiting (`src/lib/security/rate-limit.ts`) is per-IP and in-process (the portal's sign-in, Google and reset actions share `VENDOR_AUTH_RATE_LIMIT_*`, keyed per flow; the API also locks an account after repeated wrong passwords), so it is best-effort across serverless instances. It caps abuse from one warm instance; the honeypot and timing checks are the real bot gates. Swap in Upstash/Vercel KV if an exact limit is ever needed.
