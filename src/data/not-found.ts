export type NotFoundIcon = 'clock' | 'stall' | 'chat';
export type NotFoundAccent = 'brand' | 'clay' | 'ink';

export interface NotFoundLink {
	icon: NotFoundIcon;
	accent: NotFoundAccent;
	title: string;
	detail: string;
	href: string;
}

export const notFoundHero = {
	badge: 'Error 404 · Page not found',
	title: 'This stall has packed up for the day',
	body: "The page you're looking for has moved or never existed. Check the address, or head back to find a market near you.",
	primary: { label: 'Back to home', href: '/' },
	secondary: { label: 'Find a market', href: '/markets' },
};

export const notFoundLinksEyebrow = 'Try one of these instead';

export const notFoundLinks: NotFoundLink[] = [
	{
		icon: 'clock',
		accent: 'brand',
		title: 'How it works',
		detail: 'Pre-order, pick a time, pay at the stall.',
		href: '/#how-it-works',
	},
	{
		icon: 'stall',
		accent: 'clay',
		title: 'Sell with us',
		detail: 'Take pre-orders across every market you trade at.',
		href: '/sell-with-us',
	},
	{
		icon: 'chat',
		accent: 'ink',
		title: 'Contact us',
		detail: "Followed a broken link? Let us know and we'll fix it.",
		href: '/contact',
	},
];
