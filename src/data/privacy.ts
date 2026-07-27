export interface PrivacyListItem {
	lead?: string;
	text: string;
}

export type PrivacyBlock =
	| { kind: 'paragraph'; text: string }
	| { kind: 'list'; items: PrivacyListItem[] }
	| { kind: 'paragraphWithLink'; before: string; linkText: string; linkHref: string; after: string };

export interface PrivacySection {
	id: string;
	navLabel: string;
	title: string;
	blocks: PrivacyBlock[];
}

export const privacyMeta = {
	lastUpdated: 'July 27, 2026',
};

export const privacySections: PrivacySection[] = [
	{
		id: 'who-we-are',
		navLabel: 'Who we are',
		title: 'Who we are (Data Controller)',
		blocks: [
			{
				kind: 'paragraph',
				text: 'This Privacy Policy explains how we collect, use, and protect your personal data when you use the MarketDay mobile application and website (the "Service"). The Service is provided only to users in the Republic of Ireland, and we process personal data in accordance with the EU General Data Protection Regulation (Regulation (EU) 2016/679, "GDPR") and the Irish Data Protection Act 2018.',
			},
			{
				kind: 'paragraph',
				text: 'The data controller responsible for your personal data is:',
			},
			{
				kind: 'list',
				items: [
					{ lead: 'Controller', text: 'MarketDay (sole trader)' },
					{ lead: 'Trading as', text: 'MarketDay' },
					{ lead: 'Address', text: '14 Dame Street, Dublin 2, D02 X285, Ireland' },
					{ lead: 'Email', text: 'privacy@marketday.app' },
				],
			},
			{
				kind: 'paragraph',
				text: 'MarketDay is operated by a single individual. We have not appointed a Data Protection Officer, as we are not required to do so under Article 37 GDPR — all privacy queries should be sent to the email address above.',
			},
		],
	},
	{
		id: 'scope',
		navLabel: 'Scope of the Service',
		title: 'Scope of the Service',
		blocks: [
			{
				kind: 'paragraph',
				text: 'The Service allows buyers to discover local farmer markets in Ireland, browse vendor products, and place pre-orders for collection in person at the market stall.',
			},
			{
				kind: 'paragraph',
				text: 'We do not process payments. All payment for pre-ordered goods takes place directly between you and the vendor at the point of collection. We do not collect or store card details, bank details, or any financial information.',
			},
		],
	},
	{
		id: 'collect',
		navLabel: 'Information we collect',
		title: 'Personal data we collect',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Data you provide directly:',
			},
			{
				kind: 'list',
				items: [
					{
						lead: 'Account (all users)',
						text: 'email address; password, stored only as a cryptographic hash — we never store your password in readable form; your Google account identifier, email, and name, if you choose to sign in with Google; and an optional display name.',
					},
					{
						lead: 'Buyers',
						text: 'order contents (products, quantities, prices), optional notes attached to an order, and your order history.',
					},
					{
						lead: 'Vendors',
						text: 'business or stall name, business description and product category, product listings (names, descriptions, prices, images), profile and product images you upload, and the market at which you trade.',
					},
				],
			},
			{
				kind: 'paragraph',
				text: 'Data collected automatically:',
			},
			{
				kind: 'list',
				items: [
					{
						lead: 'Push notification token',
						text: 'an anonymous identifier issued by Expo/Apple/Google, used solely to send you notifications about your orders.',
					},
					{
						lead: 'Location',
						text: 'approximate or precise location, only if you grant location permission, and only to show markets near you. Your location is used on-device and in transient queries — we do not store a history of your location.',
					},
					{
						lead: 'Technical and log data',
						text: 'IP address, device type, operating system version, app version, and timestamps of requests, recorded in server logs for security and troubleshooting.',
					},
				],
			},
			{
				kind: 'paragraph',
				text: 'Special category data: we do not intentionally collect special category data (Article 9 GDPR) such as health, religious, or political data. Please do not include such information in free-text fields, for example order notes. Note that dietary preferences you voluntarily disclose in a note may reveal such information — we ask you not to provide it.',
			},
		],
	},
	{
		id: 'legal-basis',
		navLabel: 'Why we use your data',
		title: 'Why we use your data and our legal basis',
		blocks: [
			{
				kind: 'paragraph',
				text: 'For each purpose below, we rely on one of the legal bases set out in Article 6 GDPR:',
			},
			{
				kind: 'list',
				items: [
					{
						lead: 'Creating and managing your account',
						text: 'email, password hash, Google ID, and role — necessary to perform our contract with you (Art. 6(1)(b)).',
					},
					{
						lead: 'Processing and fulfilling pre-orders',
						text: 'order details and buyer/vendor details — necessary to perform our contract with you (Art. 6(1)(b)).',
					},
					{
						lead: 'Sending transactional notifications about your order status',
						text: 'push token and order status — necessary to perform our contract with you (Art. 6(1)(b)).',
					},
					{
						lead: 'Sending password reset codes by email',
						text: 'email address and a one-time code — necessary to perform our contract with you (Art. 6(1)(b)).',
					},
					{
						lead: 'Showing markets near your location',
						text: 'device location — based on your consent, given through the device permission and withdrawable at any time in settings (Art. 6(1)(a)).',
					},
					{
						lead: 'Displaying vendor profiles and products publicly in the app',
						text: 'vendor business data and product data — necessary to perform our contract with the vendor (Art. 6(1)(b)).',
					},
					{
						lead: 'Keeping the Service secure, preventing abuse and fraud, diagnosing faults',
						text: 'log data and IP address — our legitimate interest in operating a secure service (Art. 6(1)(f)).',
					},
					{
						lead: 'Retaining order records after account closure',
						text: 'anonymised order data — our legitimate interest in the integrity of vendor records (Art. 6(1)(f)).',
					},
					{
						lead: 'Optional marketing or product-update emails, if introduced',
						text: 'email address — based on your consent, opt-in and withdrawable at any time (Art. 6(1)(a)).',
					},
				],
			},
			{
				kind: 'paragraph',
				text: "Where we rely on legitimate interests, we have carried out a balancing assessment and consider that our interest in operating a secure and reliable service does not override your rights and freedoms. You may object to this processing at any time — see Your rights below.",
			},
		],
	},
	{
		id: 'sharing',
		navLabel: 'Who we share data with',
		title: 'Who we share your data with',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Important for buyers: when you place a pre-order, the vendor receives your display name, email address, order contents, and any notes you include. This is necessary so the vendor can prepare and hand over your order. Vendors act as independent data controllers in respect of the order information they receive, and are responsible for their own use of that information.',
			},
			{
				kind: 'paragraph',
				text: 'We use the following service providers to operate the Service. Each processes data only on our documented instructions, under a data processing agreement:',
			},
			{
				kind: 'list',
				items: [
					{
						lead: 'Railway Corp.',
						text: 'application and database hosting — all account, order, and log data — USA / EU regions.',
					},
					{
						lead: 'Cloudflare, Inc. (R2)',
						text: 'image storage — product and profile images — global CDN.',
					},
					{
						lead: 'Expo (650 Industries, Inc.)',
						text: 'push notification delivery — push tokens, notification content — USA.',
					},
					{
						lead: 'Resend (Plus Five Five, Inc.)',
						text: 'transactional email delivery — email address, email content — USA.',
					},
					{
						lead: 'Google Ireland Ltd. / Google LLC',
						text: '"Sign in with Google" authentication — email, name, Google account ID — EU / USA.',
					},
					{
						lead: 'Vercel Inc.',
						text: 'hosting of the administrative dashboard — administrator session data — USA.',
					},
				],
			},
			{
				kind: 'paragraph',
				text: 'We do not sell your personal data, and we do not share it with advertisers or data brokers.',
			},
			{
				kind: 'paragraph',
				text: 'We may also disclose personal data where required by Irish or EU law, by court order, or to establish, exercise, or defend legal claims.',
			},
		],
	},
	{
		id: 'transfers',
		navLabel: 'International transfers',
		title: 'International transfers',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Some of our providers are established in the United States. Where personal data is transferred outside the European Economic Area, we rely on:',
			},
			{
				kind: 'list',
				items: [
					{
						text: 'Standard Contractual Clauses approved by the European Commission (Article 46(2)(c) GDPR), incorporated into our agreements with each provider; and',
					},
					{
						text: "where applicable, the provider's certification under the EU–US Data Privacy Framework (Article 45 GDPR adequacy decision).",
					},
				],
			},
			{
				kind: 'paragraphWithLink',
				before: 'You may request a copy of the relevant safeguards by contacting us at ',
				linkText: 'privacy@marketday.app',
				linkHref: 'mailto:privacy@marketday.app',
				after: '.',
			},
		],
	},
	{
		id: 'retention',
		navLabel: 'How long we keep data',
		title: 'How long we keep your data',
		blocks: [
			{
				kind: 'list',
				items: [
					{ lead: 'Account data (active account)', text: 'kept until you delete your account.' },
					{ lead: 'Account data after deletion request', text: 'anonymised immediately — see below.' },
					{
						lead: 'Order records',
						text: '6 years from the date of the order, in anonymised form after account deletion.',
					},
					{ lead: 'Password reset codes', text: '15 minutes, then deleted.' },
					{ lead: 'Refresh tokens', text: 'until logout, password reset, or expiry (7 days).' },
					{ lead: 'Server and security logs', text: '30 days.' },
					{ lead: 'Push notification tokens', text: 'until you uninstall the app or disable notifications.' },
				],
			},
			{
				kind: 'paragraph',
				text: "Anonymisation instead of deletion: when you request deletion of your account, we replace your identifying data (email, name, Google ID, password hash, push token) with irreversible placeholder values. Your order records remain in the system in a form that can no longer be linked to you, because vendors need accurate historical records of transactions and we may need them for tax and accounting purposes. Once anonymised, the data is no longer personal data under the GDPR.",
			},
		],
	},
	{
		id: 'security',
		navLabel: 'Security',
		title: 'Security',
		blocks: [
			{
				kind: 'paragraph',
				text: 'We apply technical and organisational measures appropriate to the risk, including:',
			},
			{
				kind: 'list',
				items: [
					{ text: 'Passwords hashed with bcrypt; plaintext passwords are never stored or logged.' },
					{ text: 'All traffic encrypted in transit using TLS.' },
					{ text: 'Database encryption at rest, as provided by our hosting provider.' },
					{ text: 'Short-lived access tokens and rotating refresh tokens.' },
					{ text: 'Rate limiting on authentication and password-reset endpoints.' },
					{ text: 'Access to production systems restricted to the operator of the Service alone.' },
				],
			},
			{
				kind: 'paragraph',
				text: 'No system is completely secure. In the event of a personal data breach likely to result in a risk to your rights and freedoms, we will notify the Data Protection Commission within 72 hours and, where the risk is high, we will notify you directly.',
			},
		],
	},
	{
		id: 'rights',
		navLabel: 'Your rights',
		title: 'Your rights',
		blocks: [
			{ kind: 'paragraph', text: 'Under the GDPR you have the right to:' },
			{
				kind: 'list',
				items: [
					{ lead: 'Access', text: 'obtain a copy of the personal data we hold about you.' },
					{ lead: 'Rectification', text: 'have inaccurate or incomplete data corrected.' },
					{ lead: 'Erasure', text: 'have your data deleted, subject to the anonymisation approach described above.' },
					{ lead: 'Restriction', text: 'ask us to limit how we use your data.' },
					{
						lead: 'Portability',
						text: 'receive your data in a structured, machine-readable format, or have it transmitted to another controller.',
					},
					{ lead: 'Object', text: 'object to processing based on legitimate interests.' },
					{
						lead: 'Withdraw consent',
						text: 'at any time, where processing is based on consent — this does not affect the lawfulness of processing carried out before withdrawal.',
					},
					{
						lead: 'Not be subject to automated decision-making',
						text: 'we do not carry out automated decision-making or profiling that produces legal or similarly significant effects.',
					},
				],
			},
			{
				kind: 'paragraphWithLink',
				before: 'To exercise any of these rights, email ',
				linkText: 'privacy@marketday.app',
				linkHref: 'mailto:privacy@marketday.app',
				after:
					'. We will respond within one month — this period may be extended by two further months for complex requests, in which case we will tell you within the first month. Exercising your rights is free of charge, unless a request is manifestly unfounded or excessive.',
			},
			{
				kind: 'paragraph',
				text: 'Account deletion can also be carried out directly in the app under Profile → Settings → Delete account.',
			},
		],
	},
	{
		id: 'children',
		navLabel: "Children's privacy",
		title: "Children's privacy",
		blocks: [
			{
				kind: 'paragraph',
				text: 'The Service is not intended for children. Under section 31 of the Data Protection Act 2018, the digital age of consent in Ireland is 16 — you must be at least 16 years old to create an account. If we become aware that we hold personal data relating to a person under 16, we will delete it without undue delay.',
			},
		],
	},
	{
		id: 'cookies',
		navLabel: 'Cookies',
		title: 'Cookies and similar technologies',
		blocks: [
			{
				kind: 'paragraph',
				text: "The mobile application does not use cookies. It stores authentication tokens in the device's secure storage, which is strictly necessary for you to remain signed in.",
			},
			{
				kind: 'paragraph',
				text: 'The administrative dashboard, used only by our own staff, uses strictly necessary cookies to maintain a login session. We do not use analytics, advertising, or tracking cookies anywhere in the Service. If this changes, we will request your consent in advance in accordance with the ePrivacy Regulations (S.I. No. 336 of 2011).',
			},
		],
	},
	{
		id: 'changes',
		navLabel: 'Changes to this policy',
		title: 'Changes to this policy',
		blocks: [
			{
				kind: 'paragraph',
				text: 'We may update this policy from time to time. The "last updated" date at the top will always reflect the current version. If we make material changes — for example, introducing online payments or a new category of processing — we will notify you in the app or by email before the changes take effect.',
			},
		],
	},
	{
		id: 'complaints',
		navLabel: 'Complaints',
		title: 'Complaints',
		blocks: [
			{
				kind: 'paragraph',
				text: 'If you are unhappy with how we have handled your data, you have the right to lodge a complaint with the Irish supervisory authority:',
			},
			{
				kind: 'list',
				items: [
					{
						lead: 'Data Protection Commission',
						text: '21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland — www.dataprotection.ie — +353 (0)1 765 0100 / 1800 437 737.',
					},
				],
			},
			{
				kind: 'paragraph',
				text: 'You may also lodge a complaint with the supervisory authority of your habitual residence or place of work.',
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

export const privacyContact = {
	email: 'privacy@marketday.app',
	postalAddress: 'MarketDay, 14 Dame Street, Dublin 2, D02 X285, Ireland',
};
