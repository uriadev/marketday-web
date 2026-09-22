// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production origin. Required for the absolute URLs social crawlers and search engines
  // need — canonical, og:url and og:image are all resolved against it in Layout.astro.
  site: 'https://marketday.ie',

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // rrule (used server-side by /markets) ships CommonJS as `main` and ESM as `module`. Left
      // external, Node loads the CommonJS build and the named imports fail; bundled, Vite picks
      // the ESM build and they resolve.
      noExternal: ['rrule']
    }
  },

  // Market photos from the API are served from the catalog bucket. Listing the host lets
  // <Image> optimise them; a URL on any other host still renders, just unoptimised.
  image: {
    domains: ['catalog.marketday.ie']
  },

  adapter: vercel(),

  // Rejects cross-origin POSTs to on-demand routes (the actions endpoint).
  // This is already the default; pinned here so it can't be silently lost.
  security: {
    checkOrigin: true
  },

  env: {
    schema: {
      // The MarketDay API's GraphQL endpoint — the local API listens on 3000. Use 127.0.0.1
      // rather than localhost: localhost can resolve to IPv6 ::1, which Docker Desktop's port
      // forwarding doesn't answer, and the request hangs instead of failing.
      API_URL: envField.string({
        context: 'server',
        access: 'public',
        default: 'http://127.0.0.1:3000/graphql'
      }),

      // Sent as `x-api-key`. Secret, so it stays server-side and never reaches the browser.
      // Optional here so an unconfigured checkout still runs against a local API that has no
      // key set; the client throws instead of sending unauthenticated in production.
      API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),

      API_TIMEOUT_MS: envField.number({ context: 'server', access: 'public', default: 10000 }),

      CONTACT_RATE_LIMIT_MAX: envField.number({ context: 'server', access: 'public', default: 5 }),
      CONTACT_RATE_LIMIT_WINDOW_MS: envField.number({
        context: 'server',
        access: 'public',
        default: 3600000
      }),

      DELETE_ACCOUNT_RATE_LIMIT_MAX: envField.number({ context: 'server', access: 'public', default: 5 }),
      DELETE_ACCOUNT_RATE_LIMIT_WINDOW_MS: envField.number({
        context: 'server',
        access: 'public',
        default: 3600000
      }),

      // Test-build invite dialog, opened by the store badges. Roomier than the other two: a
      // household behind one NAT address can plausibly ask for invites on several devices.
      APP_INVITE_RATE_LIMIT_MAX: envField.number({ context: 'server', access: 'public', default: 8 }),
      APP_INVITE_RATE_LIMIT_WINDOW_MS: envField.number({
        context: 'server',
        access: 'public',
        default: 3600000
      }),

      // Vendor portal sign-in, Google sign-in and password reset, per IP. The API also locks
      // an account after repeated wrong passwords; this caps one source trying many accounts.
      VENDOR_AUTH_RATE_LIMIT_MAX: envField.number({ context: 'server', access: 'public', default: 10 }),
      VENDOR_AUTH_RATE_LIMIT_WINDOW_MS: envField.number({
        context: 'server',
        access: 'public',
        default: 900000
      }),

      // The Google OAuth *web* client ID — the same one as the API's GOOGLE_CLIENT_ID, since
      // the API only accepts ID tokens minted for it. Public by nature (it is in the button's
      // markup). Unset hides "Sign in with Google" on /vendor/login.
      PUBLIC_GOOGLE_CLIENT_ID: envField.string({ context: 'client', access: 'public', optional: true })
    }
  },

  integrations: [
    sitemap({
      // The vendor portal is on-demand and private; keep it out even if a page is ever
      // prerendered by mistake. Anchored so /vendor-help stays in.
      filter: (page) => !/^\/vendor(\/|$)/.test(new URL(page).pathname),
      // Build format is 'directory', so the integration would list every page with a trailing
      // slash — but Layout.astro canonicalises without one. Listing a URL that then points its
      // canonical elsewhere makes the sitemap disagree with the pages it advertises, so strip
      // the slash here (bar the root) to keep the two spellings identical.
      serialize(item) {
        item.url = item.url.replace(/(?<!\/\/)\/$/, '');
        return item;
      }
    })
  ]
});