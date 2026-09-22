/**
 * The two places the vendor portal sends a browser somewhere it was told to go: back to the
 * page a signed-out visitor asked for, and out to Stripe. Both are allowlists, so a crafted
 * `?next=` or a tampered API response can't make the site an open redirect.
 */

export const PORTAL_HOME = '/vendor/billing';

/** Signing in again from one of these would just bounce, so they never count as a target. */
const PUBLIC_PORTAL_PATHS = new Set(['/vendor/login', '/vendor/forgot-password']);

/**
 * Where to send a vendor after signing in. Only a same-site path inside the portal is
 * accepted: no scheme, no `//host` (protocol-relative), no backslash (browsers read `/\host`
 * as `//host`), and no control characters. Anything else falls back to the billing page.
 */
export function safeNextPath(raw: string | null | undefined): string {
	if (!raw || raw.length > 512) return PORTAL_HOME;
	if (!raw.startsWith('/vendor/') && raw !== '/vendor') return PORTAL_HOME;
	if (raw.includes('//') || raw.includes('\\') || /[\u0000-\u001f\u007f]/.test(raw)) return PORTAL_HOME;

	const path = raw.split(/[?#]/)[0].replace(/\/+$/, '');
	if (PUBLIC_PORTAL_PATHS.has(path)) return PORTAL_HOME;

	return raw;
}

/**
 * Hosts Stripe serves Checkout, the customer portal, hosted invoices and invoice PDFs from.
 * If Stripe is ever given a custom domain (e.g. `billing.marketday.ie`), add it here.
 */
const STRIPE_HOSTS = new Set(['checkout.stripe.com', 'billing.stripe.com', 'invoice.stripe.com', 'pay.stripe.com']);

/** True only for an `https:` URL on a Stripe host. */
export function isStripeUrl(raw: string | null | undefined): raw is string {
	if (!raw) return false;
	try {
		const url = new URL(raw);
		return url.protocol === 'https:' && STRIPE_HOSTS.has(url.hostname) && !url.username && !url.password;
	} catch {
		return false;
	}
}
