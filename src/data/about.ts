export interface AboutStat {
	value: string;
	label: string;
}

export const aboutStats: AboutStat[] = [
	{ value: '40+', label: 'Markets across Dublin and beyond' },
	{ value: '12k+', label: 'Shoppers pre-ordering weekly' },
	{ value: '600+', label: 'Independent vendors on the app' },
	{ value: '9.2t', label: 'Produce saved from going unsold in 2025' },
];

export type AboutValueIcon = 'leaf' | 'bag' | 'card';
export type AboutValueAccent = 'brand' | 'clay';

export interface AboutValue {
	icon: AboutValueIcon;
	accent: AboutValueAccent;
	title: string;
	description: string;
}

export const aboutValues: AboutValue[] = [
	{
		icon: 'leaf',
		accent: 'brand',
		title: 'Vendors come first',
		description:
			"We only make money when a vendor makes a sale — never a booking fee added on top of the shopper's price.",
	},
	{
		icon: 'bag',
		accent: 'clay',
		title: 'Less waste, always',
		description: 'Every feature is judged against one question: does this help a stall pick to order instead of guessing?',
	},
	{
		icon: 'card',
		accent: 'brand',
		title: 'No middlemen pricing',
		description: 'You pay the stall price, at the stall. We never take a cut out of what a shopper hands over.',
	},
];
