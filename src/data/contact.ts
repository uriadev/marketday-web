export type ContactIcon = 'mail' | 'bag';
export type ContactAccent = 'brand' | 'clay';

export interface ContactCard {
	icon: ContactIcon;
	accent: ContactAccent;
	title: string;
	detail: string;
	meta: string;
}

export const contactCards: ContactCard[] = [
	{
		icon: 'mail',
		accent: 'brand',
		title: 'General enquiries',
		detail: 'hello@marketday.ie',
		meta: 'Mon–Fri, 9am–6pm',
	},
	{
		icon: 'bag',
		accent: 'clay',
		title: 'Vendor support',
		detail: 'vendors@marketday.ie',
		meta: 'Onboarding & payouts',
	},
];

export const contactHq = {
	name: 'Our launch',
	lines: ['Cork, Ireland', 'Expanding nationwide'],
};

export type ContactRole = 'shopper' | 'vendor';

export interface ContactRoleCopy {
	role: ContactRole;
	label: string;
	subjectPlaceholder: string;
	messagePlaceholder: string;
}

export const contactRoles: ContactRoleCopy[] = [
	{
		role: 'shopper',
		label: 'Shopper',
		subjectPlaceholder: "What's your question about?",
		messagePlaceholder: "Tell us what's up...",
	},
	{
		role: 'vendor',
		label: 'Vendor',
		subjectPlaceholder: 'e.g. Onboarding, payouts, stock',
		messagePlaceholder: 'Tell us about your stall and what you need...',
	},
];

/**
 * Shared by the form markup (`minlength`/`maxlength`) and the server-side schema in
 * src/actions/index.ts, so the two can't drift. The browser check is UX; the server check
 * is the one that counts.
 */
export const contactFormLimits = {
	name: { min: 2, max: 80 },
	email: { max: 254 },
	subject: { min: 3, max: 150 },
	message: { min: 20, max: 4000 },
} as const;

/**
 * Name of the honeypot field. Plausible enough that a form-filling bot wants to complete it,
 * and not a field a real person can see or tab into.
 */
export const contactHoneypotField = 'website';
