import type { AstroCookies } from 'astro';
import { ApiError, ApiOperationUnavailable } from '../api/client';
import { type AuthUser, getMe, logOut, refreshSession } from '../api/vendor-auth';
import { clearSession, jwtExpiry, readAccessCookie, readRefreshCookie, writeSession } from './cookies';

/**
 * Resolves the vendor portal's session from its cookies (`./cookies.ts`), refreshing the
 * access token when it is about to lapse.
 *
 * `AstroCookies.get` returns a value set earlier in the same request, so once the middleware
 * has refreshed, the page and anything it calls read the new token without it being passed
 * around.
 */

/** Refresh this early, so a token doesn't expire between the check and the API reading it. */
const REFRESH_MARGIN_MS = 60_000;

/** No usable session: redirect to sign-in. */
export class NotSignedIn extends Error {
	constructor() {
		super('Not signed in to the vendor portal');
		this.name = 'NotSignedIn';
	}
}

function isAuthStatus(error: unknown): boolean {
	return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

/**
 * A live access token, or `null` when there is no session to be had.
 *
 * **A refused refresh leaves the cookies alone.** Two requests racing to refresh with one
 * token is normal (two tabs, a page load beside an action), and the API lets exactly one
 * win. The loser must not delete the cookies the winner has just set, so it only reports
 * "signed out" for its own request. That sends it to the sign-in page, which reads the
 * winner's cookies and bounces straight back. A genuinely dead session keeps its cookies
 * until the next sign-in overwrites them or sign-out clears them; they grant nothing.
 *
 * Any other failure (the API is down) propagates: that isn't a signed-out visitor.
 */
export async function currentAccessToken(
	cookies: AstroCookies,
	{ force = false }: { force?: boolean } = {},
): Promise<string | null> {
	const access = readAccessCookie(cookies);
	if (!force && access) {
		const expiry = jwtExpiry(access);
		if (expiry !== null && expiry - Date.now() > REFRESH_MARGIN_MS) return access;
	}

	const refresh = readRefreshCookie(cookies);
	if (!refresh) return null;

	try {
		const session = await refreshSession(refresh);
		writeSession(cookies, session);
		return session.accessToken;
	} catch (error) {
		if (isAuthStatus(error)) return null;
		throw error;
	}
}

/**
 * Runs one authenticated API call. A 401 means the access token was refused (expired early,
 * or its session ended), so it refreshes once and retries once. A 403 is never retried: the
 * token was fine, and the answer won't change.
 */
export async function withVendorAuth<T>(cookies: AstroCookies, call: (accessToken: string) => Promise<T>): Promise<T> {
	const token = await currentAccessToken(cookies);
	if (!token) throw new NotSignedIn();

	try {
		return await call(token);
	} catch (error) {
		if (!(error instanceof ApiError) || error.status !== 401) throw error;
	}

	const retry = await currentAccessToken(cookies, { force: true });
	if (!retry) throw new NotSignedIn();
	try {
		return await call(retry);
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) throw new NotSignedIn();
		throw error;
	}
}

/**
 * Ends this device's session on the API, best-effort, then clears the cookies whatever the
 * API said: signing out must never be something an outage can prevent.
 */
export async function endSession(cookies: AstroCookies): Promise<void> {
	try {
		const token = await currentAccessToken(cookies);
		if (token) await logOut(token);
	} catch (error) {
		console.warn('[vendor-portal] logout call failed; clearing cookies anyway', error);
	}
	clearSession(cookies);
}

/**
 * Only a vendor's owner may use the portal: every subscription and team operation is
 * owner-only on the API. Staff run the stall from the app.
 */
export function isOwner(user: Pick<AuthUser, 'role' | 'vendorRole'>): boolean {
	return user.role === 'VENDOR' && user.vendorRole === 'OWNER';
}

export interface PortalOwner {
	fullName: string;
	email: string;
	vendorName: string;
}

export type PortalState =
	| { status: 'signed-in'; owner: PortalOwner }
	| { status: 'signed-out' }
	| { status: 'unavailable' };

/**
 * Who is asking, for the middleware. One `me` per portal page: the API re-reads the account
 * on every request anyway, and this is what notices an owner who has since been removed or
 * suspended. A session that no longer belongs to an owner is ended here.
 */
export async function resolvePortal(cookies: AstroCookies): Promise<PortalState> {
	try {
		const me = await withVendorAuth(cookies, getMe);
		if (!isOwner(me) || !me.vendor) {
			await endSession(cookies);
			return { status: 'signed-out' };
		}
		return {
			status: 'signed-in',
			owner: { fullName: me.fullName, email: me.email, vendorName: me.vendor.name },
		};
	} catch (error) {
		if (error instanceof NotSignedIn) return { status: 'signed-out' };
		if (isAuthStatus(error)) {
			clearSession(cookies);
			return { status: 'signed-out' };
		}
		console.error('[vendor-portal] could not resolve the session', error);
		return { status: 'unavailable' };
	}
}

/**
 * One read for a portal page, reduced to what the page renders:
 * - `ok`, with the value.
 * - `missing`: the running API doesn't have the operation yet (see the Billing API contract
 *   in `src/lib/api/vendor-billing.ts`).
 * - `signed-out`: the session died mid-page.
 * - `failed`: anything else, logged here and never rendered.
 *
 * Reads run in parallel and each fails on its own. That's why they're separate documents:
 * one document naming an unshipped field would fail validation as a whole.
 */
export type PortalRead<T> =
	| { status: 'ok'; value: T }
	| { status: 'missing' }
	| { status: 'signed-out' }
	| { status: 'failed' };

export async function portalRead<T>(
	cookies: AstroCookies,
	label: string,
	call: (accessToken: string) => Promise<T>,
): Promise<PortalRead<T>> {
	try {
		return { status: 'ok', value: await withVendorAuth(cookies, call) };
	} catch (error) {
		if (error instanceof ApiOperationUnavailable) return { status: 'missing' };
		if (error instanceof NotSignedIn) return { status: 'signed-out' };
		console.error(`[vendor-portal] ${label} failed`, error);
		return { status: 'failed' };
	}
}
