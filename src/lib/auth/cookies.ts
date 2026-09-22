import type { AstroCookies, AstroCookieSetOptions } from 'astro';

/**
 * The vendor portal's session: the API's two JWTs, each in its own httpOnly cookie. There is
 * no server-side session store — Vercel has none built in — and the API is header-only
 * (`Authorization: Bearer`, CORS without credentials), so the browser holds the tokens but
 * only this site's server ever reads them or forwards them.
 *
 * - `httpOnly`: page scripts can't read them, so an injected script can't lift the session.
 * - `SameSite=Lax`: they stay off cross-site POSTs. Not `Strict`: a vendor arriving from a
 *   trial email's link to `/vendor/billing` must still arrive signed in.
 * - `path=/`: actions are served from `/_actions/*`, outside `/vendor`.
 * - `__Host-` in production: requires `Secure` and `path=/`, and forbids `Domain`, so no
 *   other `*.marketday.ie` host can plant or shadow them. Dev runs over plain http, where
 *   the prefix (and `Secure`) can't be used.
 */

const PREFIX = import.meta.env.PROD ? '__Host-' : '';
export const ACCESS_COOKIE = `${PREFIX}md_vendor_at`;
export const REFRESH_COOKIE = `${PREFIX}md_vendor_rt`;

/** Used only when a token carries no readable `exp` — the API's own defaults. */
const FALLBACK_ACCESS_SECONDS = 15 * 60;
const FALLBACK_REFRESH_SECONDS = 7 * 24 * 60 * 60;

const baseOptions = {
	httpOnly: true,
	secure: import.meta.env.PROD,
	sameSite: 'lax',
	path: '/',
} as const satisfies AstroCookieSetOptions;

/**
 * The token's `exp`, in epoch milliseconds, read **without verifying** the signature. It
 * only decides when to refresh and how long a cookie lives; the API verifies every token it
 * is sent, so a forged `exp` buys nothing.
 */
export function jwtExpiry(token: string): number | null {
	const payload = token.split('.')[1];
	if (!payload) return null;
	try {
		const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: unknown };
		return typeof json.exp === 'number' ? json.exp * 1000 : null;
	} catch {
		return null;
	}
}

function secondsUntil(token: string, fallback: number): number {
	const expiry = jwtExpiry(token);
	if (expiry === null) return fallback;
	return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
}

export interface SessionTokens {
	accessToken: string;
	refreshToken: string;
}

export function writeSession(cookies: AstroCookies, tokens: SessionTokens): void {
	cookies.set(ACCESS_COOKIE, tokens.accessToken, {
		...baseOptions,
		maxAge: secondsUntil(tokens.accessToken, FALLBACK_ACCESS_SECONDS),
	});
	cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
		...baseOptions,
		maxAge: secondsUntil(tokens.refreshToken, FALLBACK_REFRESH_SECONDS),
	});
}

export function clearSession(cookies: AstroCookies): void {
	// Same attributes as the set: a `__Host-` cookie is only replaced by a Set-Cookie that
	// also carries `Secure` and `Path=/`.
	cookies.delete(ACCESS_COOKIE, baseOptions);
	cookies.delete(REFRESH_COOKIE, baseOptions);
}

export function readAccessCookie(cookies: AstroCookies): string | undefined {
	return cookies.get(ACCESS_COOKIE)?.value || undefined;
}

export function readRefreshCookie(cookies: AstroCookies): string | undefined {
	return cookies.get(REFRESH_COOKIE)?.value || undefined;
}
