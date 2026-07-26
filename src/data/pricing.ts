export interface PricingPlan {
	name: string;
	subtitle: string;
	price: string;
	priceSuffix: string;
	badge?: string;
	features: string[];
	cta: string;
	variant: 'light' | 'dark';
}

export const pricingPlans: PricingPlan[] = [
	{
		name: 'Standard',
		subtitle: 'For any vendor, any stall',
		price: 'Free',
		priceSuffix: 'forever',
		features: [
			'Pre-orders at one market',
			'Stock & inventory tools',
			'Weekly payouts',
			'0% commission on orders',
			'Email & chat support',
		],
		cta: 'Start free',
		variant: 'light',
	},
	{
		name: 'Pro',
		subtitle: 'For vendors trading several markets',
		price: '€19',
		priceSuffix: '/ month',
		badge: 'Multi-market',
		features: [
			'Everything in Standard',
			'Unlimited markets, one dashboard',
			'Sales & waste analytics',
			'Daily payouts instead of weekly',
			'Priority phone support',
		],
		cta: 'Try Pro free for 30 days',
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
