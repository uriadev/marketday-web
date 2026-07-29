import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import {
	CONTACT_RATE_LIMIT_MAX,
	CONTACT_RATE_LIMIT_WINDOW_MS,
	DELETE_ACCOUNT_RATE_LIMIT_MAX,
	DELETE_ACCOUNT_RATE_LIMIT_WINDOW_MS,
} from 'astro:env/server';

import { contactFormLimits, contactHoneypotField, type ContactRole } from '../data/contact';
import {
	deleteAccountFormLimits,
	deleteAccountHoneypotField,
	deleteAccountSupportEmail,
} from '../data/delete-account';
import { submitContactMessage } from '../lib/api/contact';
import {
	checkAccountDeletionLink,
	confirmAccountDeletion,
	requestAccountDeletion,
} from '../lib/api/delete-account';
import { GraphQLBusinessError } from '../lib/api/client';
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

const deleteAccountInput = z.object({
	email: z
		.string()
		.trim()
		.max(deleteAccountFormLimits.email.max)
		.pipe(z.email('Please enter a valid email address.')),
	confirmed: z.coerce.boolean(),

	// Spam signals — same heuristics as the contact form, see isObviousSpam above.
	[deleteAccountHoneypotField]: z.string().nullish(),
	renderedAt: z.coerce.number().nullish(),
});

/** Same reasoning as isObviousSpam: discarded silently, never surfaced to the caller. */
function isObviousDeleteAccountSpam(input: z.infer<typeof deleteAccountInput>): string | null {
	if (input[deleteAccountHoneypotField]) return 'honeypot filled';

	const renderedAt = input.renderedAt;
	if (typeof renderedAt === 'number' && Number.isFinite(renderedAt)) {
		const elapsed = Date.now() - renderedAt;
		if (elapsed < MIN_FILL_MS) return `submitted after ${elapsed}ms`;
		if (elapsed > MAX_PAGE_AGE_MS) return 'stale page';
	} else {
		return 'missing timing token';
	}

	return null;
}

/**
 * 128 matches the backend DTO's `@MaxLength` (`AccountDeletionLinkInput`, deliberately not
 * pinned to the exact token length — see that file). Not a form field, so no honeypot/timing
 * signals: the only abuse surface is guessing a 256-bit token, which entropy and the rate
 * limits below already cover.
 */
const deletionLinkTokenInput = z.object({
	token: z.string().trim().min(1).max(128),
});

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

				try {
					// The API owns routing (which inbox the role maps to), templating and the send.
					// This site only validates, filters spam, and forwards.
					await submitContactMessage({
						role,
						name: senderName,
						email: senderEmail,
						subject: cleanSubject,
						message: body,
					});
				} catch (error) {
					// Log the cause, return a generic message: API errors can carry configuration
					// detail that shouldn't reach the browser.
					console.error('[contact] failed to submit message', error);
					throw new ActionError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'We could not send your message right now. Please email us directly.',
					});
				}

				return { ok: true as const };
			},
		}),
	},

	deleteAccount: {
		/**
		 * Request step of the self-serve web deletion flow: forwards the submitted address to
		 * the API, which emails a one-time confirmation link to it if the address matches an
		 * account (`requestAccountDeletionLink` — see `AccountDeletionLinkService.requestLink`
		 * in the backend). This action never looks up or touches any account itself; the API
		 * resolver always resolves `true` regardless of whether the email matches anyone, which
		 * is also why this handler always returns `{ ok: true }` — the "always return ok"
		 * pattern below exists to keep spam-gate behaviour opaque to bots, same as the contact
		 * form, and happens to match the no-enumeration behaviour the API already guarantees.
		 *
		 * Deletion itself is not manual and is not handled here: opening the emailed link lands
		 * on `/delete-account?token=...`, which `checkLink`/`confirm` below drive.
		 */
		request: defineAction({
			accept: 'form',
			input: deleteAccountInput,
			handler: async (input, context) => {
				const ip = getClientIp(context.request);
				const rateLimit = checkRateLimit(
					`delete-account:${ip}`,
					DELETE_ACCOUNT_RATE_LIMIT_MAX,
					DELETE_ACCOUNT_RATE_LIMIT_WINDOW_MS,
				);
				if (!rateLimit.allowed) {
					throw new ActionError({
						code: 'TOO_MANY_REQUESTS',
						message: 'You have sent several requests already. Please try again a little later.',
					});
				}

				const requesterEmail = input.email.trim().toLowerCase();
				if (!requesterEmail || !input.confirmed) {
					throw new ActionError({
						code: 'BAD_REQUEST',
						message: 'Please enter your account email and check the confirmation box.',
					});
				}

				const spamReason = isObviousDeleteAccountSpam(input);
				if (spamReason) {
					console.warn(`[delete-account] dropped submission (${spamReason})`);
					return { ok: true as const };
				}

				try {
					await requestAccountDeletion({ email: requesterEmail });
				} catch (error) {
					console.error('[delete-account] failed to submit request', error);
					throw new ActionError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'We could not send your request right now. Please email us directly.',
					});
				}

				return { ok: true as const };
			},
		}),

		/**
		 * Checks a deletion link's token without spending it, so the confirm page can render
		 * "this link has expired" instead of a button that fails on click. Any failure — rate
		 * limit or an API error — is treated the same by the caller: "we couldn't check this,"
		 * which is deliberately distinct from a clean `{ valid: false }` answer ("this link
		 * really is expired/used"). See `checkAccountDeletionLink` in
		 * `src/lib/api/delete-account.ts`.
		 */
		checkLink: defineAction({
			input: deletionLinkTokenInput,
			handler: async (input, context) => {
				const ip = getClientIp(context.request);
				const rateLimit = checkRateLimit(
					`delete-account-check:${ip}`,
					DELETE_ACCOUNT_RATE_LIMIT_MAX,
					DELETE_ACCOUNT_RATE_LIMIT_WINDOW_MS,
				);
				if (!rateLimit.allowed) {
					throw new ActionError({
						code: 'TOO_MANY_REQUESTS',
						message: 'Please wait a little while before trying again.',
					});
				}

				try {
					const valid = await checkAccountDeletionLink(input.token);
					return { valid };
				} catch (error) {
					console.error('[delete-account] failed to check link', error);
					throw new ActionError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'We could not check this link right now. Please try again shortly.',
					});
				}
			},
		}),

		/**
		 * Spends the token and deletes the account, instantly and irreversibly
		 * (`AccountDeletionService.run` → `purge`, one DB transaction). Called only from an
		 * explicit button click on the confirm page — never automatically — so a mail
		 * scanner's GET prefetch of the emailed link can never trigger it; see
		 * `AccountDeletionLinkService`'s doc comment in the backend for why that split exists.
		 *
		 * Unlike every other action in this file, a thrown `GraphQLBusinessError` here is
		 * forwarded to the browser near-verbatim instead of replaced with a generic message —
		 * every throw in this mutation's backend call chain is a deliberately-authored,
		 * user-safe sentence (expired/invalid link, open orders, remaining team members), never
		 * a stack trace. See `confirmAccountDeletion` in `src/lib/api/delete-account.ts` for the
		 * full reasoning. Every other failure mode still follows the "log and replace" rule.
		 */
		confirm: defineAction({
			input: deletionLinkTokenInput,
			handler: async (input, context) => {
				const ip = getClientIp(context.request);
				const rateLimit = checkRateLimit(
					`delete-account-confirm:${ip}`,
					DELETE_ACCOUNT_RATE_LIMIT_MAX,
					DELETE_ACCOUNT_RATE_LIMIT_WINDOW_MS,
				);
				if (!rateLimit.allowed) {
					throw new ActionError({
						code: 'TOO_MANY_REQUESTS',
						message: 'Please wait a little while before trying again.',
					});
				}

				try {
					await confirmAccountDeletion(input.token);
				} catch (error) {
					if (error instanceof GraphQLBusinessError) {
						console.warn('[delete-account] confirmAccountDeletion rejected:', error.detail);
						throw new ActionError({ code: 'BAD_REQUEST', message: error.detail });
					}
					console.error('[delete-account] failed to confirm deletion', error);
					throw new ActionError({
						code: 'INTERNAL_SERVER_ERROR',
						message: `We could not delete your account right now. Please email us at ${deleteAccountSupportEmail} and we'll take care of it.`,
					});
				}

				return { ok: true as const };
			},
		}),
	},
};
