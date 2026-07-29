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
					"If that address matches an account, we'll email it a confirmation link — usable once, and only for one hour.",
					'Open the link and confirm on the page it takes you to. Your account and its personal data are deleted immediately — this step is instant and cannot be undone.',
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

export interface DeleteAccountConfirmCopy {
	checkingTitle: string;
	checkingBody: string;
	checkErrorTitle: string;
	checkErrorBody: string;
	invalidTitle: string;
	invalidBody: string;
	confirmTitle: string;
	confirmBody: string;
	confirmButtonLabel: string;
	confirmButtonBusyLabel: string;
	successTitle: string;
	successBody: string;
}

/** Copy for `DeleteAccountConfirm.astro` — the landing page for the emailed `?token=` link. */
export const deleteAccountConfirmCopy: DeleteAccountConfirmCopy = {
	checkingTitle: 'Checking your link…',
	checkingBody: "Hang on while we check this link — it'll only take a moment.",

	checkErrorTitle: "We couldn't check this link",
	checkErrorBody: 'Something went wrong reaching the server. Check your connection and try again.',

	invalidTitle: 'This link is invalid or has expired',
	invalidBody:
		'Deletion links are single-use and expire after an hour. If you still want to delete your account, request a new one below.',

	confirmTitle: 'Confirm account deletion',
	confirmBody:
		"This is the last step. Clicking the button below deletes your MarketDay account and the personal data linked to it immediately — this can't be undone.",
	confirmButtonLabel: 'Yes, delete my account',
	confirmButtonBusyLabel: 'Deleting your account…',

	successTitle: 'Your account has been deleted',
	successBody:
		"Your MarketDay account and the personal data linked to it have been deleted. We've sent a confirmation to your email.",
};
