import type { FaqEntry } from './home';

export type VendorHelpTopicIcon = 'card' | 'bag' | 'pin' | 'clock';
export type VendorHelpAccent = 'brand' | 'clay';

export interface VendorHelpTopic {
	icon: VendorHelpTopicIcon;
	accent: VendorHelpAccent;
	title: string;
	description: string;
}

export const vendorHelpTopics: VendorHelpTopic[] = [
	{
		icon: 'card',
		accent: 'brand',
		title: 'Getting started',
		description: 'Applying, verification, and going live at your first market.',
	},
	{
		icon: 'bag',
		accent: 'clay',
		title: 'Inventory & stock',
		description: 'Listing produce, updating stock, and managing per-stall quantities.',
	},
	{
		icon: 'pin',
		accent: 'brand',
		title: 'Orders & queues',
		description: 'Reading your order queue, marking ready, and handling no-shows.',
	},
	{
		icon: 'clock',
		accent: 'clay',
		title: 'Payouts & billing',
		description: 'Payout schedule, bank details, and understanding your statements.',
	},
];

export const vendorHelpFaqs: FaqEntry[] = [
	{
		q: 'How do I get verified as a vendor?',
		a: "After you apply, our team confirms your market pitch and stall details, usually within one business day. You'll get a notification once you're live.",
	},
	{
		q: 'Can I sell at more than one market?',
		a: 'Yes — every market you trade at gets its own inventory and order queue, all reachable from one account. Standard covers one market; Pro adds unlimited markets in a single dashboard.',
	},
	{
		q: 'When do I get paid?',
		a: 'Standard payouts go out weekly to your linked bank account. Pro vendors can switch to daily payouts from Settings.',
	},
	{
		q: 'What happens if I run out of stock?',
		a: "Update your listed quantity any time and MarketDay stops taking new pre-orders for that item instantly, so shoppers never reserve something you don't have.",
	},
	{
		q: 'Do I need a card reader for in-app prepay orders?',
		a: 'No — prepaid orders settle automatically to your account. You only need your usual till for walk-up and cash sales.',
	},
	{
		q: 'Can I cancel or edit an order a shopper placed?',
		a: 'Yes, from your Orders queue you can adjust quantities or cancel before marking it ready; the shopper is notified immediately.',
	},
];
