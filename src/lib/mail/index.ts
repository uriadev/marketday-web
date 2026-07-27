import {
	MAIL_DRIVER,
	MAIL_FROM,
	MAIL_SMTP_HOST,
	MAIL_SMTP_PASS,
	MAIL_SMTP_PORT,
	MAIL_SMTP_SECURE,
	MAIL_SMTP_USER,
	RESEND_API_KEY,
} from 'astro:env/server';

import { createLogSender } from './senders/log';
import { createResendSender } from './senders/resend';
import { createSmtpSender } from './senders/smtp';
import type { MailSender } from './types';

export type { MailMessage, MailSender, MailDriver } from './types';

let cached: MailSender | undefined;

function build(): MailSender {
	switch (MAIL_DRIVER) {
		case 'resend': {
			if (!RESEND_API_KEY) {
				// Never silently swallow mail in production — a contact form that logs into the
				// void looks identical to one that works. In dev, fall back so an unconfigured
				// checkout still runs.
				if (import.meta.env.PROD) {
					throw new Error('MAIL_DRIVER is "resend" but RESEND_API_KEY is not set');
				}
				console.warn('[mail] MAIL_DRIVER=resend but RESEND_API_KEY is unset — using log driver');
				return createLogSender(MAIL_FROM);
			}
			return createResendSender(RESEND_API_KEY, MAIL_FROM);
		}
		case 'smtp':
			return createSmtpSender(
				{
					host: MAIL_SMTP_HOST,
					port: MAIL_SMTP_PORT,
					secure: MAIL_SMTP_SECURE,
					user: MAIL_SMTP_USER,
					pass: MAIL_SMTP_PASS,
				},
				MAIL_FROM,
			);
		case 'log':
			return createLogSender(MAIL_FROM);
	}
}

/** The configured sender. Built once per instance; the drivers hold no per-request state. */
export function getMailSender(): MailSender {
	cached ??= build();
	return cached;
}
