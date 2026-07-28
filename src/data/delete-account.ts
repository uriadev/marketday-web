export type DeleteAccountBlock =
	| { kind: 'paragraph'; text: string }
	| { kind: 'paragraphWithLink'; before: string; linkText: string; linkHref: string; after: string }
	| { kind: 'list'; ordered?: boolean; items: string[] };

export interface DeleteAccountSection {
	title: string;
	blocks: DeleteAccountBlock[];
}

export const deleteAccountSections: DeleteAccountSection[] = [
	{
		title: 'What gets deleted',
		blocks: [
			{
				kind: 'list',
				items: [
					'Your profile: name, email, phone number, saved addresses.',
					'Favourites, market follows, and notification preferences.',
					'Any reviews or messages linked to your account.',
				],
			},
		],
	},
	{
		title: 'What we retain, and why',
		blocks: [
			{
				kind: 'paragraphWithLink',
				before:
					'Order records are kept in anonymised form for up to six years after your last order, so we can meet Irish tax, accounting, and consumer-dispute obligations. Anonymised records can no longer be linked back to you or your account. See our ',
				linkText: 'Privacy Policy',
				linkHref: '/privacy#retention',
				after: ' for the full retention schedule.',
			},
			{
				kind: 'paragraph',
				text: 'We may also keep limited records where required to resolve an open dispute, investigate fraud, or comply with a legal obligation, for as long as that need exists.',
			},
		],
	},
	{
		title: 'How it works',
		blocks: [
			{
				kind: 'list',
				ordered: true,
				items: [
					'Submit the form with your account email.',
					"We reply from a real person to verify it's you, usually within a few business days.",
					'Once confirmed, we begin deleting your data — usually within 30 days.',
				],
			},
		],
	},
];

export const deleteAccountSupportEmail = 'privacy@marketday.ie';

/**
 * Shared by the form markup (`maxlength`) and the server-side schema in src/actions/index.ts,
 * so the two can't drift.
 */
export const deleteAccountFormLimits = {
	email: { max: 254 },
} as const;

/** Name of the honeypot field. See contactHoneypotField for the same rationale. */
export const deleteAccountHoneypotField = 'company';
