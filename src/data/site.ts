export interface NavLink {
	label: string;
	href: string;
}

export const brand = {
	name: 'MarketDay',
	logo: '/assets/marketday/logo.png',
};

export const primaryNavLinks: NavLink[] = [
	{ label: 'Markets', href: '/#why-marketday' },
	{ label: 'How it works', href: '/#how-it-works' },
	{ label: 'For vendors', href: '/#for-vendors' },
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
			{ label: 'Sell with us', href: '/#for-vendors' },
			{ label: 'Pricing', href: '#' },
			{ label: 'Vendor help', href: '#' },
		],
	},
	{
		title: 'Company',
		links: [
			{ label: 'About', href: '#' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Privacy', href: '/privacy' },
		],
	},
];

export const legalLinks: NavLink[] = [
	{ label: 'Terms', href: '#' },
	{ label: 'Privacy', href: '/privacy' },
	{ label: 'Cookies', href: '#' },
];
