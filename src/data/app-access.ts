/**
 * The app isn't in the public stores yet, so the store badges don't link anywhere — they open
 * the testing-programme dialog (`ui/AppInviteModal.astro`) instead. This module holds the bits
 * that the markup and the server action both need, so the two can't drift.
 */

export type AppPlatform = 'ios' | 'android';

export interface AppPlatformOption {
	platform: AppPlatform;
	/** Used in running copy: "a test build invite for iOS". */
	label: string;
	/** Toggle button text — names the channel the invite actually arrives through. */
	optionLabel: string;
}

export const appPlatforms: AppPlatformOption[] = [
	{ platform: 'ios', label: 'iOS', optionLabel: 'iOS (TestFlight)' },
	{ platform: 'android', label: 'Android', optionLabel: 'Android' },
];

/** Shown when the dialog is opened from a badge whose platform can't be read off the trigger. */
export const defaultAppPlatform: AppPlatform = 'ios';

/**
 * Shared by the fields' `minlength`/`maxlength` and the server-side schema in
 * src/actions/index.ts. Both mirror `contactFormLimits`, since the request is ultimately
 * delivered through the API's contact mutation and has to clear its `@Length` constraints.
 */
export const appInviteFormLimits = {
	name: { min: 2, max: 80 },
	email: { max: 254 },
} as const;

/**
 * Name of the honeypot field — plausible enough that a form-filling bot wants to complete it,
 * and not a field a real person can see or tab into. Same idea as `contactHoneypotField`.
 */
export const appInviteHoneypotField = 'website';
