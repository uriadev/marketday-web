import { vendorCategories, type VendorCategory } from '../../data/vendor-apply';
import { submitContactMessage } from './contact';

/**
 * Vendor applications ride the contact channel.
 *
 * The API has no application mutation — `submitContactMessage` is the only `@Public()` path this
 * site can reach that ends in a human's inbox (see `backend/src/schema.gql`). Sending as a
 * `vendor` routes it to the vendor inbox with the applicant's address as Reply-To, so the team
 * answers by hitting reply, and the row is persisted in `contact_messages` even if the send
 * fails. The team then creates the vendor, which starts the trial.
 *
 * If a dedicated mutation ever lands on the API, this is the only file that has to change.
 */

const CATEGORY_LABELS = Object.fromEntries(vendorCategories.map((c) => [c.id, c.label])) as Record<
	VendorCategory,
	string
>;

export interface VendorApplicationInput {
	/** Every text field is already normalised and length-checked by the action. */
	name: string;
	/** Already validated and lower-cased by the action. */
	email: string;
	phone: string;
	stall: string;
	web: string;
	categories: VendorCategory[];
	markets: string;
	note: string;
}

/**
 * The body is composed here from labelled lines. `stall` is the one typed value that reaches
 * the subject, and it arrives already collapsed to a single header-safe line by the action.
 * Resolves on success; throws `ApiError` otherwise.
 */
export async function submitVendorApplication(input: VendorApplicationInput): Promise<void> {
	const lines = [
		'New vendor application from marketday.ie.',
		'',
		`Name: ${input.name}`,
		`Email: ${input.email}`,
		`Phone: ${input.phone || '—'}`,
		`Stall: ${input.stall}`,
		`Website / Instagram: ${input.web || '—'}`,
		`Sells: ${input.categories.map((c) => CATEGORY_LABELS[c]).join(', ')}`,
		`Markets: ${input.markets}`,
	];
	if (input.note) lines.push('', 'Notes:', input.note);
	lines.push('', 'Agreed to the vendor terms and privacy policy. Reply to this email to respond.');

	await submitContactMessage({
		role: 'vendor',
		name: input.name,
		email: input.email,
		subject: `Vendor application: ${input.stall}`,
		message: lines.join('\n'),
	});
}
