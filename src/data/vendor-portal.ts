import type { NavLink } from './site';

/**
 * Copy for the vendor portal (`/vendor/*`). Every message a portal page or its scripts show
 * is a static string from here — never text the visitor typed, never raw API text. The only
 * API text that reaches a vendor is the deliberately authored refusals the actions forward
 * (see `src/actions/vendor-portal.ts`).
 */

export const vendorPortalTabs: NavLink[] = [
	{ label: 'Billing', href: '/vendor/billing' },
	{ label: 'Markets', href: '/vendor/markets' },
	{ label: 'Team', href: '/vendor/team' },
];

/**
 * Shared by the form markup and the server-side schemas in `src/actions/vendor-portal.ts`,
 * so the two can't drift.
 */
export const vendorPortalFormLimits = {
	email: { max: 254 },
	password: { max: 256 },
	/** The API accepts 6; the portal asks for more when a password is being set. */
	newPassword: { min: 8, max: 128 },
	resetCode: { length: 6 },
} as const;

/** `backend/src/vendors/domain/seat.ts` → `MAX_STAFF_PER_STALL`. Shown as a hint only. */
export const staffPerMarketLimit = 2;

export const vendorPortalMessages = {
	wrongPassword: "That email and password don't match. Check them and try again.",
	googleRejected: "Google sign-in didn't go through. Please try again, or sign in with your email and password.",
	tooManyAttempts: 'Too many attempts from this connection. Please wait a few minutes and try again.',
	staffSeat:
		"This is a staff account. Billing and the team are managed by your business owner — you can keep running your stall from the MarketDay app.",
	notLinked:
		"This account isn't linked to a vendor business. If you've been invited to join one, enter the code in the MarketDay app, or contact us to start selling.",
	sessionEnded: 'Your session has ended. Please sign in again.',
	unreachable: 'We could not reach the server. Please check your connection and try again.',
	genericFailure: 'Something went wrong on our side. Please try again in a moment.',
	billingNotLive: "Online payments aren't switched on yet. We'll email you before billing starts.",
	passwordsDiffer: "The two passwords don't match.",
	passwordChanged: 'Your password is changed.',
} as const;

/** `?reason=` on the sign-in page. Unknown values show nothing. */
export const loginReasons: Record<string, string> = {
	'signed-out': "You've signed out.",
};

/**
 * `?done=` after a successful change. Each form names its key (`PortalForm`'s `done` prop);
 * unknown values show nothing, so the URL can't be used to put words on the page.
 */
export const portalNotices: Record<string, string> = {
	invited: "Invite sent. They'll get a 6-digit code by email to enter in the MarketDay app within 15 minutes.",
	resent: 'A new code is on its way. The previous one no longer works.',
	revoked: 'Invite cancelled. The code no longer works.',
	moved: 'Staff member moved to their new market.',
	removed: "Staff member removed. They keep their MarketDay account but can no longer run your stall.",
	markets: 'Your markets are updated. Your plan follows them, and any difference is prorated on your next invoice.',
};

/** One row on the Markets tab. */
export interface MarketOption {
	id: string;
	name: string;
	/** What the search matches on, with the name. */
	city: string;
	/** When it trades, e.g. `Sat, 09:00–14:00`. */
	detail: string;
}

/**
 * What the Markets tab (`sections/VendorMarkets.astro`) warns before a change is saved. Its
 * script fills `{from}`, `{to}` (monthly prices) and `{markets}` (market names, which are
 * published data, not visitor input), and sets the result with `textContent`.
 */
export const marketChangeCopy = {
	adding: 'Adding: {markets}.',
	removing: 'Leaving: {markets}.',
	/** A live subscription (ACTIVE or PAST_DUE). */
	paid: 'Your plan goes from {from} to {to} a month. The difference is prorated on your next invoice.',
	/** A live subscription whose price doesn't move, e.g. from no market to one. */
	unchanged: 'Your plan stays at {to} a month.',
	trial: "You're on a free trial, so nothing changes today. After it, your plan is {to} a month.",
	complimentary: 'Your access is complimentary, so nothing changes today. Afterwards your plan is {to} a month.',
	unsubscribed: 'When you subscribe, your plan will be {to} a month.',
	/** The billing overview couldn't be read, so there are no prices to quote. */
	unpriced: 'Your subscription follows your markets, so this changes what you are billed.',
	/** Every box unticked: the API still bills one market. */
	noMarkets: 'With no markets, your plan still covers one.',
	leaving:
		'Leaving a market removes the products you list there, and your order settings for it. Staff pinned to it should be moved on the Team tab.',
	inactive: "Your subscription isn't active, so you can't add a market until you subscribe.",
} as const;

export type NoticeTone = 'brand' | 'gold' | 'danger' | 'muted';

export const subscriptionStatusCopy: Record<
	'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'COMPLIMENTARY' | 'INACTIVE',
	{ label: string; tone: NoticeTone }
> = {
	TRIAL: { label: 'Free trial', tone: 'gold' },
	ACTIVE: { label: 'Active', tone: 'brand' },
	PAST_DUE: { label: 'Payment due', tone: 'danger' },
	COMPLIMENTARY: { label: 'Complimentary', tone: 'brand' },
	INACTIVE: { label: 'Inactive', tone: 'muted' },
};

export const invoiceStatusCopy: Record<
	'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE',
	{ label: string; tone: NoticeTone }
> = {
	DRAFT: { label: 'Upcoming', tone: 'muted' },
	OPEN: { label: 'Due', tone: 'danger' },
	PAID: { label: 'Paid', tone: 'brand' },
	VOID: { label: 'Void', tone: 'muted' },
	UNCOLLECTIBLE: { label: 'Unpaid', tone: 'danger' },
};

export const checkoutNotices: Record<string, { tone: NoticeTone; text: string }> = {
	success: {
		tone: 'brand',
		text: "Thanks — your payment went through. It can take a minute for your subscription to show here; refresh if it hasn't.",
	},
	cancelled: { tone: 'muted', text: "Checkout cancelled. You haven't been charged." },
};
