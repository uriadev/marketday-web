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
      // 'resend' in production, 'smtp' for local Mailpit, 'log' to print instead of sending.
      MAIL_DRIVER: envField.enum({
        context: 'server',
        access: 'public',
        values: ['resend', 'smtp', 'log'],
        default: 'log'
      }),

      // Must be on a Resend-verified domain, or Resend rejects the send.
      MAIL_FROM: envField.string({
        context: 'server',
        access: 'public',
        default: 'MarketDay <noreply@marketday.app>'
      }),

      CONTACT_INBOX_SHOPPER: envField.string({
        context: 'server',
        access: 'public',
        default: 'hello@marketday.app'
      }),

      CONTACT_INBOX_VENDOR: envField.string({
        context: 'server',
        access: 'public',
        default: 'vendors@marketday.app'
      }),

      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),

      // Mailpit defaults. Use 127.0.0.1 rather than localhost: localhost can resolve to IPv6 ::1,
      // which Docker Desktop's port forwarding doesn't answer, and the SMTP connection hangs
      // instead of failing.
      MAIL_SMTP_HOST: envField.string({ context: 'server', access: 'public', default: '127.0.0.1' }),
      MAIL_SMTP_PORT: envField.number({ context: 'server', access: 'public', default: 1025 }),
      MAIL_SMTP_SECURE: envField.boolean({ context: 'server', access: 'public', default: false }),
      MAIL_SMTP_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_SMTP_PASS: envField.string({ context: 'server', access: 'secret', optional: true }),

      CONTACT_RATE_LIMIT_MAX: envField.number({ context: 'server', access: 'public', default: 5 }),
      CONTACT_RATE_LIMIT_WINDOW_MS: envField.number({
        context: 'server',
        access: 'public',
        default: 3600000
      })
    }
  }
});
