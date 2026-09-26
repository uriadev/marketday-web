import type { Feature } from './home';

export const sellReasons: Feature[] = [
	{
		title: 'Know your day before it starts',
		description:
			"See pre-orders roll in the night before, so you pick exactly what's needed and load the van with confidence.",
		icon: 'box',
		accent: 'brand',
	},
	{
		title: 'Paid at the stall, 0% commission',
		description:
			'Shoppers pay you directly when they collect, so every euro is yours on the day. One flat monthly price, never a cut of your sales.',
		icon: 'receipt',
		accent: 'clay',
	},
	{
		title: 'One queue, every market',
		description: 'Trade at three markets a week? One app, one order queue, per-stall inventory that stays in sync.',
		icon: 'leaf',
		accent: 'brand',
	},
];

export interface VendorStep {
	number: string;
	title: string;
	description: string;
	variant: 'light' | 'dark';
}

export const vendorSteps: VendorStep[] = [
	{
		number: '01',
		title: 'Apply',
		description: 'Tell us your stall, markets and produce — takes under five minutes.',
		variant: 'light',
	},
	{
		number: '02',
		title: 'List your stock',
		description: "Add what you're bringing each week — photos optional, updates take seconds.",
		variant: 'light',
	},
	{
		number: '03',
		title: 'Get verified',
		description: "We confirm your market pitch so shoppers know you're the real stall.",
		variant: 'light',
	},
	{
		number: '04',
		title: 'Start taking orders',
		description: 'Pre-orders appear in your queue, sorted by collection time.',
		variant: 'dark',
	},
];

export interface SellTestimonial {
	quote: string;
	name: string;
	role: string;
	initials: string;
}

export const sellTestimonial: SellTestimonial = {
	quote:
		"Pre-orders mean I pick to order and go home nearly sold out. Half the waste, steadier income — it's changed how we trade.",
	name: 'McNally Family Farm',
	role: 'Vendor · Cork',
	initials: 'MF',
};
