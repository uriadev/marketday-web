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
 * The launch discount advertised across the vendor pages. The API applies it (the Stripe coupon
 * behind `STRIPE_LAUNCH_COUPON_ID`) to vendors created before `LAUNCH_OFFER_JOINED_BEFORE`.
 * Set `active` to false when that date passes, and every mention of it disappears.
 */
export const launchOffer = {
	active: true,
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

export const pricingPlans: PricingPlan[] = [
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
		href: '/contact?role=vendor',
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
