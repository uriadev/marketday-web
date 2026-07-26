import marketImage from '../assets/marketday/market-1.png';

export type StepIcon = 'pin' | 'basket' | 'clock' | 'box';

export interface Step {
	number: string;
	title: string;
	description: string;
	icon: StepIcon;
	variant: 'light' | 'dark';
}

export const steps: Step[] = [
	{
		number: '01',
		title: 'Find a market',
		description: 'Browse by day and distance, and see which stalls are trading this week.',
		icon: 'pin',
		variant: 'light',
	},
	{
		number: '02',
		title: 'Reserve produce',
		description: 'Add to your basket and pre-order ahead — no account needed to start.',
		icon: 'basket',
		variant: 'light',
	},
	{
		number: '03',
		title: 'Pick a time',
		description: 'Choose a collection slot that suits you and walk straight up — skip the queue.',
		icon: 'clock',
		variant: 'light',
	},
	{
		number: '04',
		title: 'Pay at the stall',
		description: 'Your order goes straight to the stallholder. Nothing upfront, nothing wasted.',
		icon: 'box',
		variant: 'dark',
	},
];

export type FeatureIcon = 'receipt' | 'sparkle' | 'leaf' | 'clock' | 'box';
export type FeatureAccent = 'brand' | 'clay';

export interface Feature {
	title: string;
	description: string;
	icon: FeatureIcon;
	accent: FeatureAccent;
}

export const heroFeature = {
	title: 'Skip the queue entirely',
	description:
		'Walk up to a bagged, ready order at your chosen time. No standing around on a busy Saturday morning.',
	image: marketImage,
};

export const features: Feature[] = [
	{
		title: 'No fees, pay on collection',
		description: 'Never a booking fee. You pay the stall price, at the stall.',
		icon: 'receipt',
		accent: 'brand',
	},
	{
		title: 'Support local growers',
		description: 'Every order goes straight to independent stallholders you know.',
		icon: 'sparkle',
		accent: 'clay',
	},
	{
		title: 'Less food wasted',
		description: 'Vendors pick to order, so less is left over at the end of the day.',
		icon: 'leaf',
		accent: 'brand',
	},
	{
		title: 'Ready when you are',
		description: "Get a nudge when it's picked, and collect on your schedule.",
		icon: 'clock',
		accent: 'clay',
	},
];

export type AvatarTone = 'mint' | 'peach';

export interface Testimonial {
	quote: string;
	name: string;
	role: string;
	initials: string;
	variant: 'light' | 'dark';
	avatarTone?: AvatarTone;
}

export const testimonials: Testimonial[] = [
	{
		quote: "I order Friday night and my veg is bagged and waiting at 10. I've got my Saturday mornings back.",
		name: 'Sofia R.',
		role: 'Shopper · Dublin 8',
		initials: 'SR',
		variant: 'light',
		avatarTone: 'mint',
	},
	{
		quote:
			"Pre-orders mean I pick to order and go home nearly sold out. Half the waste, steadier income — it's changed how we trade.",
		name: 'McNally Family Farm',
		role: 'Vendor · Temple Bar',
		initials: 'MF',
		variant: 'dark',
	},
	{
		quote: "Found three stalls near me I never knew existed. Now it's our weekend ritual — the kids pick the fruit.",
		name: "Liam O'Brien",
		role: 'Shopper · Rathmines',
		initials: 'LO',
		variant: 'light',
		avatarTone: 'peach',
	},
];

export interface VendorBenefit {
	label: string;
}

export const vendorBenefits: VendorBenefit[] = [
	{ label: 'One queue for orders across all your markets' },
	{ label: 'Per-stall inventory, updated in a tap' },
	{ label: 'Weekly payouts, no per-order fees' },
];

export interface FaqEntry {
	q: string;
	a: string;
}

export const faqs: FaqEntry[] = [
	{
		q: 'Do I pay in the app?',
		a: "No — you pay the stallholder at the stall when you collect. There's never a booking fee, and you pay exactly the stall price.",
	},
	{
		q: 'Do I need an account to order?',
		a: "You can start a pre-order without one. You'll just add a name and number so the stall knows who's collecting.",
	},
	{
		q: 'What if a stall sells out of something?',
		a: 'Stock updates live, so you only ever reserve what’s actually available. If anything changes, the vendor lets you know before pickup.',
	},
	{
		q: 'Can I change or cancel a pre-order?',
		a: "Yes. As long as the stall hasn't marked it ready, you can edit or cancel it from your Orders tab in a couple of taps.",
	},
	{
		q: 'Which markets and cities are covered?',
		a: "We're live at 40+ markets across Dublin today and adding new ones every week. Search your area in the app to see what's nearby.",
	},
];
