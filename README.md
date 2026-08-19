# MarketDay — marketing site

The marketing site for [MarketDay](https://marketday.ie): reserve produce from local market stalls, pick a collection time, and pay when you arrive. Built with [Astro](https://astro.build) and Tailwind CSS 4, deployed to Vercel.

## Stack

- **Astro** — every page is prerendered static HTML; there are no client-side framework islands.
- **Tailwind CSS 4** via the Vite plugin, with theme tokens defined in `src/styles/global.css` (no `tailwind.config.js`).
- **Vercel adapter** — the form actions (`/_actions/*`) and the `/app/*` universal-link catch-all are the only on-demand (server) routes; everything else ships static.

## Getting started

Requires Node ≥22.12 and [pnpm](https://pnpm.io).

```sh
pnpm install
cp .env.example .env   # every value has a working default
pnpm dev                # starts the dev server at localhost:4321
```

## Scripts

| Command           | Action                                    |
| :----------------- | :----------------------------------------- |
| `pnpm dev`          | Start the dev server at `localhost:4321`   |
| `pnpm build`        | Build the production site to `./dist/`     |
| `pnpm preview`      | Preview the production build locally       |
| `pnpm astro check`  | Type-check `.astro` files                  |

There is no lint or test suite in this repo.

## Forms and the API

The `/contact` and `/delete-account` forms, and the app test-build invite dialog, validate input, filter spam, and forward to the MarketDay API — this site never sends email itself. To exercise them locally, run the API from the sibling `backend` repo (`pnpm start:dev`) and leave `API_URL` at its `.env.example` default.

## Universal links

Everything under `/app/*` is reserved for links meant to open the MarketDay mobile app (order, market, vendor, invite, and reset-password links); `public/.well-known/` advertises that to iOS and Android, and `src/pages/app/[...path].astro` is the fallback page for when the link can't open the app.

## More detail

[AGENTS.md](./AGENTS.md) (also linked as `CLAUDE.md`) has the full architecture write-up — page composition, component layers, data conventions, and the security invariants around the form endpoints.
