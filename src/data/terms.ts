export interface TermsListItem {
	lead?: string;
	text: string;
}

export type TermsBlock =
	| { kind: 'paragraph'; text: string }
	| { kind: 'list'; items: TermsListItem[] }
	| { kind: 'paragraphWithLink'; before: string; linkText: string; linkHref: string; after: string };

export interface TermsSection {
	id: string;
	navLabel: string;
	title: string;
	blocks: TermsBlock[];
}

export const termsMeta = {
	lastUpdated: 'July 1, 2026',
};

export const termsSections: TermsSection[] = [
	{
		id: 'agreement',
		navLabel: 'Agreement to terms',
		title: 'Agreement to terms',
		blocks: [
			{
				kind: 'paragraph',
				text: 'These Terms of Service govern your use of the MarketDay app and website, operated by MarketDay ("we", "us"). By creating an account or placing an order, you agree to these terms. If you don\'t agree, please don\'t use MarketDay.',
			},
		],
	},
	{
		id: 'accounts',
		navLabel: 'Accounts',
		title: 'Accounts',
		blocks: [
			{
				kind: 'paragraph',
				text: "You must provide accurate information when creating an account and keep it up to date. You're responsible for activity under your account and for keeping your login secure. You must be at least 16 years old to use MarketDay.",
			},
		],
	},
	{
		id: 'orders',
		navLabel: 'Orders & collection',
		title: 'Orders & collection',
		blocks: [
			{
				kind: 'paragraph',
				text: 'A pre-order is a reservation with the vendor, not a purchase made through MarketDay. Prices, availability and stock are set by each vendor and may change until you collect.',
			},
			{
				kind: 'list',
				items: [
					{ text: 'Orders must be collected within the window shown at checkout.' },
					{ text: 'Repeated no-shows may limit your ability to pre-order in future.' },
					{ text: "Payment for orders happens at the stall unless you've chosen to prepay in-app." },
				],
			},
		],
	},
	{
		id: 'vendors',
		navLabel: 'Vendor obligations',
		title: 'Vendor obligations',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Vendors are independent businesses, not MarketDay employees. Vendors must keep listed stock accurate, honour confirmed pre-orders, and hold any licenses required to trade at their markets. MarketDay may suspend a vendor account for repeated cancellations or complaints.',
			},
		],
	},
	{
		id: 'payments',
		navLabel: 'Payments & fees',
		title: 'Payments & fees',
		blocks: [
			{
				kind: 'paragraphWithLink',
				before: 'MarketDay charges vendors software fees as described on our ',
				linkText: 'Pricing page',
				linkHref: '/pricing',
				after: '. Shoppers are never charged a booking fee. Optional in-app prepayment carries a standard card-processing fee, disclosed before you confirm. All fees are non-refundable except where required by law.',
			},
		],
	},
	{
		id: 'conduct',
		navLabel: 'Acceptable use',
		title: 'Acceptable use',
		blocks: [
			{ kind: 'paragraph', text: 'You agree not to:' },
			{
				kind: 'list',
				items: [
					{ text: 'Misuse the platform to harass vendors or other shoppers.' },
					{ text: 'Attempt to circumvent MarketDay to avoid fees owed by a vendor.' },
					{ text: 'Post false, misleading, or fraudulent listings or reviews.' },
					{ text: "Reverse engineer, scrape, or interfere with the app's normal operation." },
				],
			},
		],
	},
	{
		id: 'ip',
		navLabel: 'Intellectual property',
		title: 'Intellectual property',
		blocks: [
			{
				kind: 'paragraph',
				text: 'The MarketDay name, app, and site content are owned by us or our licensors. You may not copy, modify, or redistribute them without permission. Vendors retain ownership of their own product photos and descriptions, and grant us a license to display them on MarketDay.',
			},
		],
	},
	{
		id: 'liability',
		navLabel: 'Liability',
		title: 'Liability',
		blocks: [
			{
				kind: 'paragraph',
				text: "MarketDay facilitates pre-orders but isn't a party to the sale between you and a vendor. We're not liable for the quality, safety, or legality of items listed, or for a vendor's failure to honour an order, though we'll help resolve disputes where we can. To the extent permitted by law, our liability is limited to fees you've paid us in the past 12 months.",
			},
		],
	},
	{
		id: 'termination',
		navLabel: 'Termination',
		title: 'Termination',
		blocks: [
			{
				kind: 'paragraph',
				text: "You may close your account at any time. We may suspend or terminate accounts that violate these terms, engage in fraud, or pose a risk to other users. Where possible, we'll give notice before termination.",
			},
		],
	},
	{
		id: 'law',
		navLabel: 'Governing law',
		title: 'Governing law',
		blocks: [
			{
				kind: 'paragraph',
				text: 'These terms are governed by the laws of Ireland. Any disputes will be handled by the courts of Ireland, without regard to conflict-of-law principles.',
			},
		],
	},
	{
		id: 'changes',
		navLabel: 'Changes to these terms',
		title: 'Changes to these terms',
		blocks: [
			{
				kind: 'paragraph',
				text: 'We may update these terms as MarketDay evolves. Material changes will be announced in the app or by email before they take effect. Continued use after changes take effect means you accept the updated terms.',
			},
		],
	},
	{
		id: 'contact',
		navLabel: 'Contact us',
		title: 'Contact us',
		blocks: [],
	},
];

export const termsContact = {
	email: 'legal@marketday.app',
	postalAddress: 'MarketDay, 14 Dame Street, Dublin 2, D02 X285, Ireland',
};
