import { defineMiddleware } from 'astro:middleware';
import { resolvePortal } from './lib/auth/session';
import { safeNextPath } from './lib/security/redirects';

/**
 * Guards the vendor portal (`/vendor/*`). Every other route passes straight through, and
 * prerendered pages are skipped outright: at build time there is no visitor to resolve.
 *
 * - **Public portal pages** (sign-in, forgot password) send an already signed-in owner on to
 *   where they were going.
 * - **Every other portal page** sends a signed-out visitor to sign in, remembering the page
 *   in `?next=` (checked again by `safeNextPath` on the way back).
 * - **An API outage** is neither: the page renders its own "can't reach MarketDay" state
 *   rather than bouncing a signed-in owner to a sign-in form.
 *
 * Actions don't come through here. Each portal action resolves the session itself
 * (`withVendorAuth`), and the API enforces owner-only on every operation.
 */

const PUBLIC_PATHS = new Set(['/vendor/login', '/vendor/forgot-password']);

function isPortalPath(path: string): boolean {
	return path === '/vendor' || path.startsWith('/vendor/');
}

export const onRequest = defineMiddleware(async (context, next) => {
	const path = context.url.pathname.replace(/\/+$/, '') || '/';
	if (context.isPrerendered || !isPortalPath(path)) return next();

	const portal = await resolvePortal(context.cookies);
	context.locals.vendorPortal = portal;

	let response: Response;
	if (PUBLIC_PATHS.has(path)) {
		response =
			portal.status === 'signed-in'
				? context.redirect(safeNextPath(context.url.searchParams.get('next')))
				: await next();
	} else if (portal.status === 'signed-out') {
		const target = `${path}${context.url.search}`;
		response = context.redirect(`/vendor/login?next=${encodeURIComponent(target)}`);
	} else {
		response = await next();
	}

	// Personal and per-request: never stored by the CDN or the browser's back/forward cache,
	// and never indexed (the pages also carry a noindex meta; this covers the redirects).
	response.headers.set('Cache-Control', 'private, no-store');
	response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	return response;
});
