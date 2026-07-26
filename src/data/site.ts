import logo from '../assets/marketday/logo.png';

export interface NavLink {
	label: string;
	href: string;
}

export const brand = {
	name: 'MarketDay',
	logo,
};

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
