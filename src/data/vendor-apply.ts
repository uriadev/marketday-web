/**
 * The vendor application form (`/sell-with-us/apply`). Holds what the markup and the server
 * action both need, so the two can't drift.
 */

export type VendorCategory =
	| 'produce'
	| 'bakery'
	| 'dairy'
	| 'meat-fish'
	| 'hot-food'
	| 'drinks'
	| 'flowers'
	| 'crafts'
	| 'other';

export interface VendorCategoryOption {
	id: VendorCategory;
	label: string;
}

export const vendorCategories: VendorCategoryOption[] = [
	{ id: 'produce', label: 'Fruit & veg' },
	{ id: 'bakery', label: 'Bakery' },
	{ id: 'dairy', label: 'Dairy & eggs' },
	{ id: 'meat-fish', label: 'Meat & fish' },
	{ id: 'hot-food', label: 'Hot food' },
	{ id: 'drinks', label: 'Drinks' },
	{ id: 'flowers', label: 'Flowers & plants' },
	{ id: 'crafts', label: 'Crafts' },
	{ id: 'other', label: 'Other' },
];

export const vendorCategoryIds = vendorCategories.map((c) => c.id) as [
	VendorCategory,
	...VendorCategory[],
];

/**
 * Shared by the fields' `minlength`/`maxlength` and the server-side schema in
 * src/actions/index.ts. `name` and `email` mirror `contactFormLimits`, since the application
 * is delivered through the API's contact mutation and has to clear its `@Length` constraints.
 * The rest are composed into the message body, which the API caps at 4,000 characters; these
 * maxima add up to well under that.
 */
export const vendorApplyFormLimits = {
	name: { min: 2, max: 80 },
	email: { max: 254 },
	phone: { max: 40 },
	stall: { min: 2, max: 100 },
	web: { max: 200 },
	markets: { min: 3, max: 400 },
	note: { max: 2000 },
} as const;

/** Same idea as `contactHoneypotField`: a field a bot wants to fill and a person never sees. */
export const vendorApplyHoneypotField = 'company';

export interface VendorApplyStep {
	number: string;
	title: string;
	description: string;
}

export const vendorApplySteps: VendorApplyStep[] = [
	{
		number: '01',
		title: 'We review your application',
		description: 'Usually within two working days.',
	},
	{
		number: '02',
		title: 'We verify your pitch',
		description: "So shoppers know you're the real stall.",
	},
	{
		number: '03',
		title: 'You list your stock',
		description: 'Then pre-orders start coming in.',
	},
];
