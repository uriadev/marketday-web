import type { AstroCookies } from 'astro';
import { ActionError, type ActionAPIContext, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { VENDOR_AUTH_RATE_LIMIT_MAX, VENDOR_AUTH_RATE_LIMIT_WINDOW_MS } from 'astro:env/server';

import { vendorPortalFormLimits, vendorPortalMessages } from '../data/vendor-portal';
import { ApiOperationUnavailable, GraphQLAuthError, GraphQLBusinessError } from '../lib/api/client';
import {
	type AuthSession,
	googleSignIn,
	logIn,
	logOut,
	requestPasswordReset,
	resetPassword,
} from '../lib/api/vendor-auth';
import { openBillingPortal, startCheckout } from '../lib/api/vendor-billing';
import {
	inviteMember,
	joinMarket,
	leaveMarket,
	listMyMarkets,
	moveMember,
	removeMember,
	revokeInvite,
} from '../lib/api/vendor-team';
import { writeSession } from '../lib/auth/cookies';
import { endSession, isOwner, NotSignedIn, withVendorAuth } from '../lib/auth/session';
import { checkRateLimit, getClientIp } from '../lib/security/rate-limit';
import { isStripeUrl, safeNextPath } from '../lib/security/redirects';

/**
 * The vendor portal's actions (`/vendor/*`), spread into `server` by `./index.ts`.
 *
 * Error codes are a contract with the portal's scripts (`ui/PortalForm.astro`):
 * - `UNAUTHORIZED`: no session. The script sends the browser to sign in. Nothing else uses
 *   it, not even a wrong password, which would otherwise bounce the sign-in form to itself.
 * - `BAD_REQUEST`: a refusal the vendor can act on. The message is shown.
 * - `FORBIDDEN`: signed in, but not allowed. The message is shown.
 *
 * Only deliberately authored API text is forwarded: `GraphQLBusinessError` and
 * `GraphQLAuthError` details. Everything else is logged and replaced, as on the public forms.
 */

const { email: emailLimit, password: passwordLimit, newPassword, resetCode } = vendorPortalFormLimits;

const emailField = z
	.string()
	.trim()
	.max(emailLimit.max, 'That email address is too long.')
	.pipe(z.email('Please enter a valid email address.'));

/** API ids are UUIDs; this only keeps anything that isn't an id out of the request. */
const idField = z
	.string()
	.trim()
	.min(1)
	.max(64)
	.regex(/^[A-Za-z0-9-]+$/, 'Invalid id.');

const nextField = z.string().max(512).nullish();

/** Keyed per IP and per flow, so tripping one limit doesn't lock someone out of another. */
function limitAuth(context: ActionAPIContext, flow: string): void {
	const ip = getClientIp(context.request);
	const { allowed } = checkRateLimit(
		`vendor-${flow}:${ip}`,
		VENDOR_AUTH_RATE_LIMIT_MAX,
		VENDOR_AUTH_RATE_LIMIT_WINDOW_MS,
	);
	if (!allowed) {
		throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: vendorPortalMessages.tooManyAttempts });
	}
}

/**
 * Keeps the session only for a vendor's owner. Anyone else is signed straight back out of
 * the session the API just opened, so no cookie is ever set for them, and is told why.
 */
async function openOwnerSession(
	cookies: AstroCookies,
	session: AuthSession,
	next: string | null | undefined,
	prefix = '',
): Promise<{ redirect: string }> {
	if (!isOwner(session.user)) {
		try {
			await logOut(session.accessToken);
		} catch (error) {
			console.warn('[vendor-portal] could not end a non-owner session', error);
		}
		const reason =
			session.user.vendorRole === 'STAFF' ? vendorPortalMessages.staffSeat : vendorPortalMessages.notLinked;
		throw new ActionError({ code: 'FORBIDDEN', message: `${prefix}${reason}` });
	}

	writeSession(cookies, session);
	return { redirect: safeNextPath(next) };
}

/**
 * The API's two terse refusals, reworded for a vendor. Every other auth sentence (lockout
 * countdown, suspension) is written to be shown and passes as-is.
 */
const REWORDED: Record<string, string> = {
	'Invalid credentials': vendorPortalMessages.wrongPassword,
	// An expired, forged or wrong-audience ID token (`InvalidGoogleToken`).
	'Invalid Google token': vendorPortalMessages.googleRejected,
};

/** For the sign-in paths. */
function signInFailure(error: unknown, label: string): never {
	if (error instanceof ActionError) throw error;
	if (error instanceof GraphQLAuthError || error instanceof GraphQLBusinessError) {
		const message = Object.hasOwn(REWORDED, error.detail) ? REWORDED[error.detail] : error.detail;
		throw new ActionError({ code: error.status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST', message });
	}
	console.error(`[vendor-portal] ${label} failed`, error);
	throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: vendorPortalMessages.genericFailure });
}

/** For every signed-in operation. */
function portalFailure(error: unknown, label: string): never {
	if (error instanceof ActionError) throw error;
	if (error instanceof NotSignedIn) {
		throw new ActionError({ code: 'UNAUTHORIZED', message: vendorPortalMessages.sessionEnded });
	}
	if (error instanceof GraphQLBusinessError || error instanceof GraphQLAuthError) {
		console.warn(`[vendor-portal] ${label} refused:`, error.detail);
		throw new ActionError({
			code: error instanceof GraphQLAuthError ? 'FORBIDDEN' : 'BAD_REQUEST',
			message: error.detail,
		});
	}
	if (error instanceof ApiOperationUnavailable) {
		console.warn(`[vendor-portal] ${label} is not on this API yet`);
		throw new ActionError({ code: 'BAD_REQUEST', message: vendorPortalMessages.billingNotLive });
	}
	console.error(`[vendor-portal] ${label} failed`, error);
	throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: vendorPortalMessages.genericFailure });
}

/** Stripe is the only place a portal action may send the browser; see `isStripeUrl`. */
function stripeRedirect(url: string, label: string): { url: string } {
	if (!isStripeUrl(url)) {
		console.error(`[vendor-portal] ${label} returned a URL outside the Stripe allowlist`);
		throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: vendorPortalMessages.genericFailure });
	}
	return { url };
}

export const vendor = {
	login: defineAction({
		accept: 'form',
		input: z.object({
			email: emailField,
			password: z.string().min(1, 'Please enter your password.').max(passwordLimit.max),
			next: nextField,
		}),
		handler: async (input, context) => {
			limitAuth(context, 'login');
			try {
				const session = await logIn(input.email.toLowerCase(), input.password);
				return await openOwnerSession(context.cookies, session, input.next);
			} catch (error) {
				signInFailure(error, 'login');
			}
		},
	}),

	/**
	 * The ID token Google Identity Services hands the button's callback, in the browser. JSON
	 * rather than a form: the button runs in popup mode and posts here from script. GIS's
	 * redirect mode would be a cross-site form POST, which `checkOrigin` rightly refuses.
	 */
	googleSignIn: defineAction({
		input: z.object({
			credential: z.string().min(1).max(4096),
			next: nextField,
		}),
		handler: async (input, context) => {
			limitAuth(context, 'google');
			try {
				const session = await googleSignIn(input.credential);
				return await openOwnerSession(context.cookies, session, input.next);
			} catch (error) {
				signInFailure(error, 'googleAuth');
			}
		},
	}),

	logout: defineAction({
		accept: 'form',
		handler: async (_input, context) => {
			await endSession(context.cookies);
			return { redirect: '/vendor/login?reason=signed-out' };
		},
	}),

	/** Always `{ ok: true }`: whether the address has an account is not this form's to say. */
	requestPasswordReset: defineAction({
		accept: 'form',
		input: z.object({ email: emailField }),
		handler: async (input, context) => {
			limitAuth(context, 'reset-request');
			try {
				await requestPasswordReset(input.email.toLowerCase());
			} catch (error) {
				console.error('[vendor-portal] requestPasswordReset failed', error);
				throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: vendorPortalMessages.genericFailure });
			}
			return { ok: true as const };
		},
	}),

	/**
	 * Sets the new password, then signs in with it, so the vendor lands in the portal rather
	 * than on a second form. The reset has ended every other session the account had.
	 */
	resetPassword: defineAction({
		accept: 'form',
		input: z.object({
			email: emailField,
			code: z
				.string()
				.trim()
				.regex(new RegExp(`^\\d{${resetCode.length}}$`), `Enter the ${resetCode.length}-digit code from the email.`),
			password: z
				.string()
				.min(newPassword.min, `Use at least ${newPassword.min} characters.`)
				.max(newPassword.max, 'That password is too long.'),
			confirmPassword: z.string().max(newPassword.max),
			next: nextField,
		}),
		handler: async (input, context) => {
			limitAuth(context, 'reset-confirm');
			if (input.password !== input.confirmPassword) {
				throw new ActionError({ code: 'BAD_REQUEST', message: vendorPortalMessages.passwordsDiffer });
			}

			const email = input.email.toLowerCase();
			try {
				await resetPassword(email, input.code, input.password);
			} catch (error) {
				signInFailure(error, 'resetPassword');
			}

			try {
				const session = await logIn(email, input.password);
				return await openOwnerSession(
					context.cookies,
					session,
					input.next,
					`${vendorPortalMessages.passwordChanged} `,
				);
			} catch (error) {
				signInFailure(error, 'login after reset');
			}
		},
	}),
};

export const vendorTeam = {
	invite: defineAction({
		accept: 'form',
		input: z.object({ email: emailField, marketId: idField }),
		handler: async (input, context) => {
			try {
				await withVendorAuth(context.cookies, (token) =>
					inviteMember(token, input.email.toLowerCase(), input.marketId),
				);
			} catch (error) {
				portalFailure(error, 'inviteVendorMember');
			}
			return { ok: true as const };
		},
	}),

	revokeInvite: defineAction({
		accept: 'form',
		input: z.object({ id: idField }),
		handler: async (input, context) => {
			try {
				await withVendorAuth(context.cookies, (token) => revokeInvite(token, input.id));
			} catch (error) {
				portalFailure(error, 'revokeVendorInvite');
			}
			return { ok: true as const };
		},
	}),

	move: defineAction({
		accept: 'form',
		input: z.object({ userId: idField, marketId: idField }),
		handler: async (input, context) => {
			try {
				await withVendorAuth(context.cookies, (token) => moveMember(token, input.userId, input.marketId));
			} catch (error) {
				portalFailure(error, 'updateVendorMember');
			}
			return { ok: true as const };
		},
	}),

	remove: defineAction({
		accept: 'form',
		input: z.object({ userId: idField }),
		handler: async (input, context) => {
			try {
				await withVendorAuth(context.cookies, (token) => removeMember(token, input.userId));
			} catch (error) {
				portalFailure(error, 'removeVendorMember');
			}
			return { ok: true as const };
		},
	}),
};

export const vendorMarkets = {
	/**
	 * The whole selection, one `marketId` per ticked box. The diff is taken inside the auth
	 * callback against the live markets, so the retry after a 401 re-reads them rather than
	 * sending a leave twice. Joins go first: an inactive subscription refuses the first one,
	 * and nothing destructive has happened yet.
	 */
	save: defineAction({
		accept: 'form',
		input: z.object({ marketId: z.array(idField).max(100).default([]) }),
		handler: async (input, context) => {
			const selected = new Set(input.marketId);
			let label = 'myVendorMarkets';
			try {
				await withVendorAuth(context.cookies, async (token) => {
					label = 'myVendorMarkets';
					const current = new Set((await listMyMarkets(token)).map((stall) => stall.marketId));
					for (const marketId of selected) {
						if (current.has(marketId)) continue;
						label = 'joinMarket';
						await joinMarket(token, marketId);
					}
					for (const marketId of current) {
						if (selected.has(marketId)) continue;
						label = 'leaveMarket';
						await leaveMarket(token, marketId);
					}
				});
			} catch (error) {
				portalFailure(error, label);
			}
			return { ok: true as const };
		},
	}),
};

export const vendorBilling = {
	/** Takes no count: the API sizes Checkout from the markets MarketDay has the vendor at. */
	checkout: defineAction({
		accept: 'form',
		handler: async (_input, context) => {
			let url: string;
			try {
				url = await withVendorAuth(context.cookies, startCheckout);
			} catch (error) {
				portalFailure(error, 'startSubscriptionCheckout');
			}
			return stripeRedirect(url, 'startSubscriptionCheckout');
		},
	}),

	portal: defineAction({
		accept: 'form',
		handler: async (_input, context) => {
			let url: string;
			try {
				url = await withVendorAuth(context.cookies, openBillingPortal);
			} catch (error) {
				portalFailure(error, 'openBillingPortal');
			}
			return stripeRedirect(url, 'openBillingPortal');
		},
	}),
};
