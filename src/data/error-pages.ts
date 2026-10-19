/**
 * Copy for the error pages (`pages/404.astro`, `pages/500.astro`). Both render the same
 * `sections/ErrorHero` + `sections/ErrorLinks` stack, so each page is one `ErrorPage` entry.
 */

export type ErrorLinkIcon = 'clock' | 'stall' | 'chat' | 'pin';
export type ErrorLinkAccent = 'brand' | 'clay' | 'ink';

export interface ErrorLink {
	icon: ErrorLinkIcon;
	accent: ErrorLinkAccent;
	title: string;
	detail: string;
	href: string;
}

export interface ErrorAction {
	label: string;
	/** An empty string reloads the current URL — the 500 page's "Try again". */
	href: string;
}

export interface ErrorPage {
	/** Three digits; the middle one is set in gold. */
	code: string;
	badge: string;
	title: string;
	body: string;
	primary: ErrorAction;
	secondary: ErrorAction;
	linksEyebrow: string;
	links: ErrorLink[];
	seo: { title: string; description: string };
}

export const notFoundPage: ErrorPage = {
	code: '404',
	badge: 'Error 404 · Page not found',
	title: 'This stall has packed up for the day',
	body: "The page you're looking for has moved or never existed. Check the address, or head back to find a market near you.",
	primary: { label: 'Back to home', href: '/' },
	secondary: { label: 'Find a market', href: '/markets' },
	linksEyebrow: 'Try one of these instead',
	links: [
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
	],
	seo: {
		title: 'Page not found — MarketDay',
		description: "The page you're looking for has moved or never existed.",
	},
};

export const serverErrorPage: ErrorPage = {
	code: '500',
	badge: 'Error 500 · Something went wrong',
	title: "Our stall's had a wobble",
	body: "Something went wrong on our side, not yours. Give it a moment and try again — if it keeps happening, let us know.",
	primary: { label: 'Try again', href: '' },
	secondary: { label: 'Back to home', href: '/' },
	linksEyebrow: 'In the meantime',
	links: [
		{
			icon: 'pin',
			accent: 'brand',
			title: 'Find a market',
			detail: 'See which markets are trading near you this week.',
			href: '/markets',
		},
		{
			icon: 'stall',
			accent: 'clay',
			title: 'Vendor help',
			detail: 'Answers for stallholders on orders, billing and payouts.',
			href: '/vendor-help',
		},
		{
			icon: 'chat',
			accent: 'ink',
			title: 'Contact us',
			detail: "Still not working? Tell us what you were doing and we'll look into it.",
			href: '/contact',
		},
	],
	seo: {
		title: 'Something went wrong — MarketDay',
		description: 'Something went wrong on our side. Please try again in a moment.',
	},
};
