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

// Mirrors the API's graduated price (backend/specs/vendor-subscriptions.md): €10 for the
// first market, €5 for each further one, VAT-inclusive, after a 30-day trial. The portal
// reads live prices from `billingOverview`; update this copy if those change.
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
		badge: '+€5 per extra market',
		features: [
			'Everything in the trial, for as long as you trade',
			'Add a market for just €5 a month more',
			'2 markets €15 · 3 markets €20',
			'Plan follows your markets automatically',
			'VAT included, cancel any time',
		],
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
