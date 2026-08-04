import logo from '../assets/marketday/logo.png';

export interface NavLink {
	label: string;
	href: string;
}

export const brand = {
	name: 'MarketDay',
	logo,
	email: 'hello@marketday.ie',
};

/**
 * Defaults for the tags in `Layout.astro`'s head. Pages override title/description via the
 * Layout props; everything else here is site-wide.
 *
 * `ogImage.src` is a path under `public/`, not an imported asset — social crawlers need a
 * stable, absolute URL, and they don't run the JS that would resolve a hashed build asset.
 * Its dimensions are declared so a crawler can lay the card out before the file downloads;
 * keep them in step with the actual file.
 */
export const seo = {
	title: 'MarketDay — Your market, pre-ordered.',
	description:
		'Reserve produce from local stalls in two minutes, pick a collection time, and pay when you arrive. No queues, no booking fees.',
	locale: 'en_IE',
	language: 'en-IE',
	themeColor: '#2f5a45',
	ogImage: {
		src: '/og.jpg',
		type: 'image/jpeg',
		width: 1424,
		height: 752,
		alt: 'MarketDay — pre-order from local market stalls and collect at a time you choose.',
	},
} as const;

export const primaryNavLinks: NavLink[] = [
	{ label: 'Markets', href: '/#why-marketday' },
	{ label: 'How it works', href: '/#how-it-works' },
	{ label: 'For vendors', href: '/sell-with-us' },
];

export interface FooterColumn {
	title: string;
	links: NavLink[];
}

export const footerColumns: FooterColumn[] = [
	{
		title: 'Shop',
		links: [
			{ label: 'Find a market', href: '#' },
			{ label: 'How it works', href: '/#how-it-works' },
			{ label: 'Get the app', href: '/#download' },
		],
	},
	{
		title: 'Vendors',
		links: [
			{ label: 'Sell with us', href: '/sell-with-us' },
			{ label: 'Pricing', href: '/pricing' },
			{ label: 'Vendor help', href: '/vendor-help' },
		],
	},
	{
		title: 'Company',
		links: [
			{ label: 'About', href: '/about' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Privacy', href: '/privacy' },
		],
	},
];

export const legalLinks: NavLink[] = [
	{ label: 'Terms', href: '/terms' },
	{ label: 'Privacy', href: '/privacy' },
	{ label: 'Cookies', href: '#' },
];
