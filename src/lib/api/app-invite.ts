import { appPlatforms, type AppPlatform } from '../../data/app-access';
import { submitContactMessage } from './contact';

/**
 * Test-build invite requests ride the contact channel.
 *
 * The API has no waitlist mutation — `submitContactMessage` is the only `@Public()` path this
 * site can reach that ends in a human's inbox (see `backend/src/schema.gql`). Sending as a
 * `shopper` routes it to the general inbox with the requester's address as Reply-To, which is
 * exactly what someone needs to do to send a TestFlight or Play invite: hit reply. The row is
 * also persisted in `contact_messages`, so the signup list survives a failed send.
 *
 * If a dedicated mutation ever lands on the API, this is the only file that has to change.
 */

const PLATFORM_LABELS: Record<AppPlatform, string> = Object.fromEntries(
	appPlatforms.map((option) => [option.platform, option.label]),
) as Record<AppPlatform, string>;

export interface AppInviteRequestInput {
	/** Already normalised and length-checked by the action — see `src/actions/index.ts`. */
	name: string;
	/** Already validated and lower-cased by the action. */
	email: string;
	platform: AppPlatform;
}

/**
 * The name and address travel as their own fields; the subject and body are authored here and
 * interpolate only `platform`, a closed union. Nothing the requester typed reaches the subject,
 * which is the value that becomes a real mail header inside the API. Resolves on success;
 * throws `ApiError` otherwise.
 */
export async function submitAppInviteRequest({
	name,
	email,
	platform,
}: AppInviteRequestInput): Promise<void> {
	const label = PLATFORM_LABELS[platform];

	await submitContactMessage({
		role: 'shopper',
		name,
		email,
		subject: `Test build invite request (${label})`,
		message:
			`Requested a ${label} test build invite from the download dialog on marketday.ie. ` +
			'Reply to this email to send the invite.',
	});
}
