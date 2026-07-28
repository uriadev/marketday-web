// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
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
      })
    }
  }
});
