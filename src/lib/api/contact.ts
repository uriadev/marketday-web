import type { ContactRole } from '../../data/contact';
import { graphqlRequest } from './client';

export interface ContactMessageInput {
	role: ContactRole;
	/** Already normalised and length-checked by the action — see `src/actions/index.ts`. */
	name: string;
	email: string;
	subject: string;
	message: string;
}

/**
 * Confirmed against the API schema (`backend/src/schema.gql`). The mutation is `@Public()`
 * on the resolver, so it is reachable without a user token — the marketing site has no
 * session, and the `x-api-key` header is the only credential it can present.
 *
 * The API owns the routing: it mails `shopper` enquiries to the general inbox and `vendor`
 * ones to the vendor inbox, with the sender's address as Reply-To. Its `ContactRole` enum
 * uses these same lower-case names, so `role` goes over the wire verbatim.
 */
const SUBMIT_CONTACT_MESSAGE = /* GraphQL */ `
	mutation SubmitContactMessage($input: SubmitContactMessageInput!) {
		submitContactMessage(input: $input)
	}
`;

/**
 * Hands the message to the API, which owns the templating and the send. Resolves on
 * success; throws `ApiError` otherwise.
 */
export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
	await graphqlRequest({
		query: SUBMIT_CONTACT_MESSAGE,
		variables: {
			input: {
				role: input.role,
				name: input.name,
				email: input.email,
				subject: input.subject,
				message: input.message,
			},
		},
		operation: 'submitContactMessage',
	});
}
