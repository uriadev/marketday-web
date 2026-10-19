export interface PricingPlan {
	name: string;
	subtitle: string;
	price: string;
	priceSuffix: string;
	badge?: string;
	features: string[];
	cta: string;
	href: string;
	variant: 'light' | 'dark';
}

/**
 * MarketDay is free for vendors during the pilot. While `active`, every vendor-facing price (the
 * marketing pages and the portal's billing and markets pages) is replaced by this copy, and the
 * launch offer is hidden. Set it to false when billing starts and the paid copy comes back.
 */
export const pilot = {
	active: true,
	badge: 'Free during our pilot',
	headline: 'MarketDay is free while we pilot',
	body: "No subscription, no card, no commission. Pilot vendors get every feature free, and we'll give you plenty of notice before anything changes.",
	short: 'Free during our pilot',
};

/**
 * Whether the portal shows a vendor the pilot instead of a price: anyone without a live
 * subscription, unless the API is actually enforcing billing on them. A vendor who really pays
 * (ACTIVE or PAST_DUE) still sees their real bill. An unreadable subscription (`null`) counts as
 * covered, since nearly every vendor is during the pilot.
 */
export function coveredByPilot(sub: { status: string; billingEnforced: boolean } | null): boolean {
	return pilot.active && sub?.status !== 'ACTIVE' && sub?.status !== 'PAST_DUE' && !sub?.billingEnforced;
}

/**
 * The launch discount advertised across the vendor pages. The API applies it (the Stripe coupon
 * behind `STRIPE_LAUNCH_COUPON_ID`) to vendors created before `LAUNCH_OFFER_JOINED_BEFORE`.
 * Set `active` to false when that date passes, and every mention of it disappears.
 */
export const launchOffer = {
	// Hidden while the pilot is free: half price of nothing scares more than it helps.
	active: !pilot.active,
	badge: 'Launch offer · 50% off',
	headline: 'Launch offer: 50% off your first 6 months',
	body: 'Join MarketDay during our launch and your plan is half price for your first six months, after your 30-day free trial. From just €5 a month.',
	short: '50% off for 6 months at launch',
};

// Mirrors the API's graduated price (backend/specs/vendor-subscriptions.md): €10 for the
// first market, €5 for each further one, VAT-inclusive, after a 30-day trial. The portal
// reads live prices from `billingOverview`; update this copy if those change.
const paidPlanFeatures = [
	'Everything in the trial, for as long as you trade',
	'Add a market for just €5 a month more',
	'2 markets €15 · 3 markets €20',
	'Plan follows your markets automatically',
	'VAT included, cancel any time',
];

const pilotPlans: PricingPlan[] = [
	{
		name: 'Pilot',
		subtitle: 'Everything MarketDay does, on us',
		price: '€0',
		priceSuffix: 'while we pilot',
		badge: pilot.badge,
		features: [
			'Full access at every market you trade at',
			'Pre-orders & stock tools from day one',
			'No subscription, no card needed',
			'0% commission on orders',
			'Email & chat support',
		],
		cta: 'Apply to sell',
		href: '/sell-with-us/apply',
		variant: 'dark',
	},
];

const paidPlans: PricingPlan[] = [
	{
		name: 'Free trial',
		subtitle: 'Your first 30 days, on us',
		price: '€0',
		priceSuffix: 'for 30 days',
		features: [
			'Full access at every market',
			'Pre-orders & stock tools from day one',
			'No card needed to start',
			'0% commission on orders',
			'Email & chat support',
		],
		cta: 'Start your free trial',
		// No self-serve sign-up: the team creates the vendor, which starts the trial.
		href: '/sell-with-us/apply',
		variant: 'light',
	},
	{
		name: 'MarketDay',
		subtitle: 'One plan that grows with your round',
		price: '€10',
		priceSuffix: '/ month, first market',
		badge: launchOffer.active ? launchOffer.badge : '+€5 per extra market',
		features: launchOffer.active
			? ['Launch vendors: half price for your first 6 months', ...paidPlanFeatures]
			: paidPlanFeatures,
		cta: 'Keep trading after your trial',
		// Signed-out visitors are sent to /vendor/login?next=/vendor/billing by the middleware.
		href: '/vendor/billing',
		variant: 'dark',
	},
];

export const pricingPlans = pilot.active ? pilotPlans : paidPlans;

export interface FeeExampleRow {
	label: string;
	value: string;
	highlight?: boolean;
	emphasis?: boolean;
}

export const feeExample = {
	label: 'Example — €40 order',
	rows: [
		{ label: 'Stall price', value: '€40.00' },
		{ label: 'MarketDay commission', value: '€0.00', highlight: true },
		{ label: 'You collect', value: '€40.00', emphasis: true },
	] as FeeExampleRow[],
};
