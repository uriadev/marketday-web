export type ContactIcon = 'mail' | 'bag';
export type ContactAccent = 'brand' | 'clay';

export interface ContactCard {
	icon: ContactIcon;
	accent: ContactAccent;
	title: string;
	detail: string;
	meta: string;
}

export const contactCards: ContactCard[] = [
	{
		icon: 'mail',
		accent: 'brand',
		title: 'General enquiries',
		detail: 'hello@marketday.app',
		meta: 'Mon–Fri, 9am–6pm',
	},
	{
		icon: 'bag',
		accent: 'clay',
		title: 'Vendor support',
		detail: 'vendors@marketday.app',
		meta: 'Onboarding & payouts',
	},
];

export const contactHq = {
	name: 'MarketDay HQ',
	lines: ['14 Dame Street', 'Dublin 2, D02 X285', 'Ireland'],
};

export type ContactRole = 'shopper' | 'vendor';

export interface ContactRoleCopy {
	role: ContactRole;
	label: string;
	subjectPlaceholder: string;
	messagePlaceholder: string;
}

export const contactRoles: ContactRoleCopy[] = [
	{
		role: 'shopper',
		label: 'Shopper',
		subjectPlaceholder: "What's your question about?",
		messagePlaceholder: "Tell us what's up...",
	},
	{
		role: 'vendor',
		label: 'Vendor',
		subjectPlaceholder: 'e.g. Onboarding, payouts, stock',
		messagePlaceholder: 'Tell us about your stall and what you need...',
	},
];
