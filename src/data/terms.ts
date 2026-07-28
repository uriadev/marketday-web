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
	lastUpdated: 'July 27, 2026',
};

export const termsSections: TermsSection[] = [
	{
		id: 'who-we-are',
		navLabel: 'Who we are',
		title: 'Who we are',
		blocks: [
			{
				kind: 'paragraph',
				text: 'These Terms of Service ("Terms") are a legal agreement between you and MarketDay ("we", "us", "the Platform"), governing your use of the MarketDay mobile application and website (together, the "Service"). By creating an account or using the Service, you agree to these Terms — if you do not agree, do not use the Service. The Service is offered only in the Republic of Ireland.',
			},
			{
				kind: 'list',
				items: [
					{ lead: 'Operator', text: 'Yoan Uria Rodriguez, operating MarketDay as an individual' },
					{ lead: 'Trading as', text: 'MarketDay' },
					{ lead: 'Email', text: 'legal@marketday.ie' },
					{ lead: 'VAT number', text: 'Not applicable — not VAT registered' },
				],
			},
		],
	},
	{
		id: 'service',
		navLabel: 'What the Service is',
		title: 'What the Service is — and what it is not',
		blocks: [
			{
				kind: 'paragraph',
				text: "MarketDay is an intermediation platform. We let buyers discover farmer markets in Ireland, browse products offered by independent vendors, and send pre-order requests for collection in person at the vendor's stall.",
			},
			{
				kind: 'list',
				items: [
					{
						lead: 'We are not a seller',
						text: 'We do not own, produce, store, handle, inspect, or deliver any product listed on the Service. Every sale is a contract between the buyer and the vendor directly — we are not a party to that contract.',
					},
					{
						lead: 'We do not process payments',
						text: "Payment is made by the buyer to the vendor in person, at the stall, on collection. We never take card details or hold money on anyone's behalf.",
					},
					{ lead: 'We do not deliver', text: 'All orders are collected in person by the buyer.' },
				],
			},
		],
	},
	{
		id: 'accounts',
		navLabel: 'Accounts',
		title: 'Accounts',
		blocks: [
			{
				kind: 'list',
				items: [
					{ text: 'You must be at least 16 years old to create a buyer account, and at least 18 years old to create a vendor account.' },
					{ text: 'You must provide accurate information and keep it up to date.' },
					{ text: 'You are responsible for keeping your login credentials secure and for all activity under your account.' },
					{ text: 'One person may hold one account. Accounts may not be sold or transferred.' },
				],
			},
			{
				kind: 'paragraphWithLink',
				before: 'Tell us immediately at ',
				linkText: 'legal@marketday.ie',
				linkHref: 'mailto:legal@marketday.ie',
				after: ' if you believe your account has been compromised.',
			},
			{
				kind: 'paragraphWithLink',
				before: 'You may close your account at any time in the app. See our ',
				linkText: 'Privacy Policy',
				linkHref: '/privacy',
				after: ' for what happens to your data.',
			},
		],
	},
	{
		id: 'preorders',
		navLabel: 'How pre-orders work',
		title: 'How pre-orders work',
		blocks: [
			{
				kind: 'list',
				items: [
					{ text: 'A buyer selects products from a vendor and submits a pre-order — this is a request, not a completed purchase.' },
					{ text: 'The vendor may accept or reject the request at their discretion. No contract of sale exists until the vendor accepts.' },
					{ text: 'Once accepted, the vendor prepares the order and marks it ready for collection.' },
					{ text: 'The buyer collects and pays the vendor at the stall on the market day.' },
					{
						text: 'Either party may cancel before collection at no cost. Because no payment is taken through the Service, no refunds are processed by us.',
					},
				],
			},
			{
				kind: 'list',
				items: [
					{
						lead: 'Prices',
						text: "shown in the app are set by vendors and are indicative. Weight-based and seasonal produce may vary slightly in final price — the price payable is the one agreed at the stall. Vendors must not charge a materially higher price than the price listed without the buyer's agreement.",
					},
					{
						lead: 'Availability',
						text: 'Vendors are responsible for keeping listings accurate. Produce is seasonal and stock can run out — we do not guarantee that any product will be available.',
					},
					{
						lead: 'Uncollected orders',
						text: 'If a buyer does not collect an accepted order by the end of the market day, the vendor may cancel it and dispose of or resell the goods. Repeatedly failing to collect orders may lead to suspension of your account.',
					},
				],
			},
		],
	},
	{
		id: 'buyer-obligations',
		navLabel: 'Buyer obligations',
		title: 'Your obligations as a buyer',
		blocks: [
			{ kind: 'paragraph', text: 'You agree to:' },
			{
				kind: 'list',
				items: [
					{ text: 'Collect orders you have placed, or cancel them in good time.' },
					{ text: 'Treat vendors and market staff respectfully.' },
					{ text: 'Not use the Service for any unlawful purpose, or to place fraudulent, abusive, or bulk speculative orders.' },
					{ text: "Not attempt to interfere with, scrape, reverse-engineer, or overload the Service." },
				],
			},
			{
				kind: 'paragraph',
				text: 'If you have a food allergy or intolerance, ask the vendor directly before purchasing — we do not verify allergen information.',
			},
		],
	},
	{
		id: 'vendor-obligations',
		navLabel: 'Vendor obligations',
		title: 'Your obligations as a vendor',
		blocks: [
			{
				kind: 'paragraph',
				text: 'If you register as a vendor, you confirm that you are trading in your own name or on behalf of a business you are authorised to represent, and you agree to:',
			},
			{
				kind: 'list',
				items: [
					{
						lead: 'Comply with all applicable law',
						text: 'including food safety and hygiene legislation, registration with the Health Service Executive or the relevant Environmental Health Service where required, food information rules under Regulation (EU) No 1169/2011 and S.I. No. 489/2014 (including allergen information), weights and measures rules, and your own tax obligations.',
					},
					{ lead: 'Hold any licence, registration, or insurance', text: 'required for the goods you sell.' },
					{ lead: 'Keep listings accurate', text: 'product names, descriptions, images, prices, and availability.' },
					{ lead: 'Honour accepted orders', text: 'and be present at the market you have listed.' },
					{
						lead: 'Handle buyer data lawfully',
						text: "You receive buyers' names, email addresses, and order details solely to fulfil the order. You act as an independent data controller for that information and must comply with the GDPR — you must not use it for marketing without a lawful basis, and must not sell or share it.",
					},
					{ lead: 'Not list prohibited goods', text: 'see the Prohibited content and goods section below.' },
				],
			},
			{ kind: 'paragraph', text: 'You are solely responsible for the products you sell and for any claim arising from them.' },
		],
	},
	{
		id: 'prohibited',
		navLabel: 'Prohibited goods',
		title: 'Prohibited content and goods',
		blocks: [
			{ kind: 'paragraph', text: 'You may not use the Service to list or supply:' },
			{
				kind: 'list',
				items: [
					{ text: 'Alcohol, tobacco, nicotine products, or any controlled substance.' },
					{ text: 'Live animals.' },
					{ text: 'Medicines, medical devices, or products making health or medicinal claims.' },
					{ text: 'Weapons, or any item unlawful to sell in Ireland.' },
					{ text: "Counterfeit goods, or goods infringing another person's trade mark or other rights." },
					{ text: 'Unpasteurised or high-risk foods where you do not hold the required approvals.' },
				],
			},
			{
				kind: 'paragraph',
				text: 'You may not upload content that is unlawful, defamatory, misleading, obscene, discriminatory, or that infringes third-party rights.',
			},
		],
	},
	{
		id: 'content-ip',
		navLabel: 'Content & IP',
		title: 'Content and intellectual property',
		blocks: [
			{
				kind: 'list',
				items: [
					{
						lead: 'Your content',
						text: 'You keep ownership of the text and images you upload. You grant us a non-exclusive, royalty-free, worldwide licence to host, store, reproduce, and display that content for the purpose of operating and promoting the Service. This licence ends when you delete the content, except for copies retained in backups for a reasonable period.',
					},
					{
						lead: 'You warrant',
						text: "that you own or are licensed to use the content you upload, and that it does not infringe anyone's rights.",
					},
					{
						lead: 'Our content',
						text: 'The Service, its software, design, name, and logo belong to us. You may not copy, modify, distribute, or create derivative works from them.',
					},
				],
			},
			{
				kind: 'paragraphWithLink',
				before:
					'Reporting illegal or infringing content — anyone may notify us of content on the Service they consider illegal or infringing by emailing ',
				linkText: 'legal@marketday.ie',
				linkHref: 'mailto:legal@marketday.ie',
				after:
					' with a description of the content, its location in the app, and the reason for the notice. We will assess notices without undue delay and inform you of our decision, in line with Article 16 of Regulation (EU) 2022/2065 (Digital Services Act).',
			},
		],
	},
	{
		id: 'suspension',
		navLabel: 'Suspension & termination',
		title: 'Suspension and termination',
		blocks: [
			{ kind: 'paragraph', text: 'We may suspend or terminate your account, or remove any listing, where:' },
			{
				kind: 'list',
				items: [
					{ text: 'you materially breach these Terms;' },
					{ text: 'we are required to do so by law or by a competent authority;' },
					{ text: 'your conduct exposes buyers, vendors, or us to legal risk, fraud, or a safety hazard; or' },
					{ text: 'your account has been inactive for more than 24 months.' },
				],
			},
			{
				kind: 'paragraph',
				text: "Except where the law prevents it or where immediate action is necessary for safety or legal reasons, we will give a vendor a statement of reasons and at least 30 days' notice before terminating their access, in line with Regulation (EU) 2019/1150 on fairness and transparency for business users of online intermediation services. Suspension of an individual listing takes effect with a statement of reasons at the time of suspension.",
			},
			{ kind: 'paragraph', text: 'You may terminate at any time by deleting your account.' },
		],
	},
	{
		id: 'ranking',
		navLabel: 'Ranking',
		title: 'Ranking of vendors and products',
		blocks: [
			{
				kind: 'paragraph',
				text: "Vendors and products are ranked primarily by relevance to the buyer's search terms, the market selected, product availability, and proximity to the buyer's location where location permission is granted. We do not accept payment for higher placement. If we introduce paid promotion in future, it will be clearly labelled as such and this section will be updated in advance.",
			},
		],
	},
	{
		id: 'availability',
		navLabel: 'Availability of the Service',
		title: 'Availability of the Service',
		blocks: [
			{
				kind: 'paragraph',
				text: 'The Service is currently provided free of charge as a personal, non-profit project, on an "as is" and "as available" basis. It is operated by Yoan Uria Rodriguez and may be unavailable for maintenance, updates, or reasons beyond our control. We do not guarantee uninterrupted or error-free operation, and we may change or discontinue any feature — or the Service itself — at any time. Where we intend to discontinue the Service entirely, we will give at least 30 days\' notice by email where reasonably possible.',
			},
		],
	},
	{
		id: 'liability',
		navLabel: 'Liability',
		title: 'Liability',
		blocks: [
			{ kind: 'paragraph', text: 'Nothing in these Terms limits or excludes our liability for:' },
			{
				kind: 'list',
				items: [
					{ text: 'death or personal injury caused by our negligence;' },
					{ text: 'fraud or fraudulent misrepresentation; or' },
					{ text: 'any liability that cannot lawfully be limited or excluded.' },
				],
			},
			{ kind: 'paragraph', text: 'Subject to that:' },
			{
				kind: 'list',
				items: [
					{
						text: "We are not liable for the quality, safety, legality, description, or fitness for purpose of any product sold by a vendor, nor for a vendor's failure to honour an order — claims about goods must be brought against the vendor.",
					},
					{ text: 'We are not liable for the acts or omissions of any buyer or vendor.' },
					{ text: 'We are not liable for indirect or consequential loss, loss of profit, loss of business, or loss of data.' },
					{
						text: 'Our total aggregate liability to you in connection with the Service is limited to €100, reflecting that the Service is provided to you free of charge.',
					},
				],
			},
			{
				kind: 'paragraph',
				text: 'Your statutory rights as a consumer are not affected. If you buy goods from a vendor, your rights against that vendor under the Consumer Rights Act 2022 and other Irish consumer legislation remain fully intact.',
			},
			{
				kind: 'paragraph',
				text: 'Vendors: you indemnify us against any claim, loss, or cost (including reasonable legal fees) arising from products you sell, content you upload, or your breach of these Terms. This indemnity does not apply to buyers acting as consumers.',
			},
		],
	},
	{
		id: 'data-protection',
		navLabel: 'Data protection',
		title: 'Data protection',
		blocks: [
			{
				kind: 'paragraphWithLink',
				before: 'We process personal data as described in our ',
				linkText: 'Privacy Policy',
				linkHref: '/privacy',
				after:
					', which forms part of these Terms. Buyers should read the data-sharing section of that policy: vendors receive your name, email address, and order details in order to fulfil your order.',
			},
		],
	},
	{
		id: 'changes',
		navLabel: 'Changes to these terms',
		title: 'Changes to these Terms',
		blocks: [
			{
				kind: 'paragraph',
				text: "We may amend these Terms. We will give you at least 15 days' notice by email or in-app before changes take effect, or 30 days' notice to vendors as required by Regulation (EU) 2019/1150. Continuing to use the Service after that date means you accept the new Terms. If you do not accept them, close your account before they take effect.",
			},
		],
	},
	{
		id: 'complaints',
		navLabel: 'Complaints & disputes',
		title: 'Complaints and dispute resolution',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Disputes about an order — contact the vendor first. Most issues about produce, price, or collection are resolved directly.',
			},
			{
				kind: 'paragraphWithLink',
				before: "Complaints about the Service or about a vendor's conduct — email ",
				linkText: 'legal@marketday.ie',
				linkHref: 'mailto:legal@marketday.ie',
				after: '. We aim to acknowledge within 5 working days and to respond substantively within 20 working days.',
			},
			{
				kind: 'paragraph',
				text: 'We are not currently required to operate a formal internal complaint-handling system under Article 11 of Regulation (EU) 2019/1150, as we fall below the small enterprise threshold, but we handle all complaints in good faith.',
			},
			{
				kind: 'paragraphWithLink',
				before: 'Consumers may also seek information or assistance from the Competition and Consumer Protection Commission (',
				linkText: 'www.ccpc.ie',
				linkHref: 'https://www.ccpc.ie',
				after: '). This does not affect your right to bring proceedings in court.',
			},
		],
	},
	{
		id: 'general',
		navLabel: 'General',
		title: 'General',
		blocks: [
			{
				kind: 'list',
				items: [
					{
						lead: 'Governing law',
						text: 'These Terms are governed by the laws of Ireland. If you are a consumer, you also benefit from the mandatory protections of the law of the country where you live.',
					},
					{
						lead: 'Jurisdiction',
						text: 'The courts of Ireland have jurisdiction. If you are a consumer resident in Ireland, you may bring proceedings in the Irish courts.',
					},
					{ lead: 'Severability', text: 'If any provision is found unenforceable, the rest remains in effect.' },
					{ lead: 'No waiver', text: 'If we do not enforce a right, we do not waive it.' },
					{
						lead: 'Entire agreement',
						text: 'These Terms and the Privacy Policy are the entire agreement between us regarding the Service.',
					},
					{
						lead: 'Assignment',
						text: 'You may not transfer your rights under these Terms. We may transfer ours if the Service is sold or reorganised, provided your rights are not reduced.',
					},
				],
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
	email: 'legal@marketday.ie',
};
