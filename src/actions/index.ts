import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import {
	CONTACT_INBOX_SHOPPER,
	CONTACT_INBOX_VENDOR,
	CONTACT_RATE_LIMIT_MAX,
	CONTACT_RATE_LIMIT_WINDOW_MS,
} from 'astro:env/server';

import { contactFormLimits, contactHoneypotField, type ContactRole } from '../data/contact';
import { getMailSender } from '../lib/mail';
import { renderContactMessageEmail } from '../lib/mail/templates/contact-message';
import { checkRateLimit, getClientIp } from '../lib/security/rate-limit';
import { countLinks, normalizeText, sanitizeHeaderValue } from '../lib/security/text';

/** Nobody fills in a four-field form in under three seconds. Bots routinely do. */
const MIN_FILL_MS = 3_000;
/** A page left open longer than this has almost certainly been served from cache to a bot. */
const MAX_PAGE_AGE_MS = 12 * 60 * 60 * 1_000;
/** Beyond this many links, the message is link-spam rather than an enquiry. */
const MAX_LINKS = 5;

const { name, email, subject, message } = contactFormLimits;

/**
 * Empty text inputs arrive as `null` (Astro converts them during FormData parsing), so the
 * `required` attributes in the markup are what keep real users out of these messages. A
 * request that reaches here with nulls is not coming from the form.
 */
const contactInput = z.object({
	role: z.enum(['shopper', 'vendor']),
	name: z.string().trim().min(name.min, 'Please enter your name.').max(name.max, 'That name is too long.'),
	email: z.string().trim().max(email.max).pipe(z.email('Please enter a valid email address.')),
	subject: z
		.string()
		.trim()
		.min(subject.min, 'Please add a short subject.')
		.max(subject.max, 'That subject is too long.'),
	message: z
		.string()
		.trim()
		.min(message.min, `Please write at least ${message.min} characters.`)
		.max(message.max, 'That message is too long.'),

	// Spam signals. Both are attacker-controllable, so they are heuristics rather than
	// security boundaries — they cost a bot effort without ever blocking a real person.
	[contactHoneypotField]: z.string().nullish(),
	renderedAt: z.coerce.number().nullish(),
});

/**
 * Discarded silently: the caller gets the same success response a real submission gets.
 *
 * Telling a bot *why* it was rejected is free tuning feedback, and a spammer who sees an
 * error retries with a variation. A human can only trip these by disabling CSS or JavaScript,
 * which is why the honeypot is off-screen rather than `display:none` and the timing window is
 * generous.
 */
function isObviousSpam(input: z.infer<typeof contactInput>, body: string): string | null {
	if (input[contactHoneypotField]) return 'honeypot filled';

	const renderedAt = input.renderedAt;
	if (typeof renderedAt === 'number' && Number.isFinite(renderedAt)) {
		const elapsed = Date.now() - renderedAt;
		if (elapsed < MIN_FILL_MS) return `submitted after ${elapsed}ms`;
		if (elapsed > MAX_PAGE_AGE_MS) return 'stale page';
	} else {
		// The field is stamped by the page's own script; its absence means the form was not
		// rendered in a browser.
		return 'missing timing token';
	}

	if (countLinks(body) > MAX_LINKS) return 'link spam';

	return null;
}

export const server = {
	contact: {
		send: defineAction({
			accept: 'form',
			input: contactInput,
			handler: async (input, context) => {
				const ip = getClientIp(context.request);
				const rateLimit = checkRateLimit(
					`contact:${ip}`,
					CONTACT_RATE_LIMIT_MAX,
					CONTACT_RATE_LIMIT_WINDOW_MS,
				);
				if (!rateLimit.allowed) {
					throw new ActionError({
						code: 'TOO_MANY_REQUESTS',
						message: 'You have sent several messages already. Please try again a little later.',
					});
				}

				// Normalise before use: strips control and bidi characters, canonicalises Unicode,
				// and collapses newline padding. Length was checked pre-normalisation, which is the
				// safe order — a body padded with 4,000 zero-width characters is rejected as too
				// long rather than quietly shrinking to nothing.
				const senderName = normalizeText(input.name);
				const senderEmail = input.email.trim().toLowerCase();
				const cleanSubject = sanitizeHeaderValue(input.subject, subject.max);
				const body = normalizeText(input.message);

				// Re-check after normalisation: input made entirely of stripped characters passes
				// the length rules above but is empty by the time it reaches the template.
				if (!senderName || !cleanSubject || body.length < message.min) {
					throw new ActionError({
						code: 'BAD_REQUEST',
						message: 'Please check your details and try again.',
					});
				}

				const spamReason = isObviousSpam(input, body);
				if (spamReason) {
					console.warn(`[contact] dropped submission (${spamReason})`);
					return { ok: true as const };
				}

				const role: ContactRole = input.role;
				const inbox = role === 'vendor' ? CONTACT_INBOX_VENDOR : CONTACT_INBOX_SHOPPER;

				const rendered = renderContactMessageEmail({
					name: senderName,
					email: senderEmail,
					role,
					subject: cleanSubject,
					message: body,
					submittedAt: new Date(),
				});

				try {
					await getMailSender().send({
						to: [inbox],
						subject: rendered.subject,
						html: rendered.html,
						text: rendered.text,
						// Bare address only. The display name would have to be RFC-encoded into a
						// header, and the sender's name is already in the body.
						replyTo: senderEmail,
					});
				} catch (error) {
					// Log the cause, return a generic message: provider errors can carry
					// configuration detail that shouldn't reach the browser.
					console.error('[contact] failed to send message', error);
					throw new ActionError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'We could not send your message right now. Please email us directly.',
					});
				}

				return { ok: true as const };
			},
		}),
	},
};
