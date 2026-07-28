import { graphqlRequest } from './client';

export interface AccountDeletionRequestInput {
	/** The address the visitor typed, lowercased. Never looked up here — the API decides. */
	email: string;
}

/**
 * TODO: confirm against the API schema (`backend/src/schema.gql`).
 *
 * Placeholder document — see the note in `contact.ts`. This is the unauthenticated,
 * manual-review request from the public site, not the in-app `deleteAccount` mutation
 * (which is JWT-guarded and irreversible); they are separate operations.
 */
const REQUEST_ACCOUNT_DELETION = /* GraphQL */ `
	mutation RequestAccountDeletion($input: RequestAccountDeletionInput!) {
		requestAccountDeletion(input: $input)
	}
`;

/** Resolves on success; throws `ApiError` otherwise. */
export async function requestAccountDeletion(input: AccountDeletionRequestInput): Promise<void> {
	await graphqlRequest({
		query: REQUEST_ACCOUNT_DELETION,
		variables: { input: { email: input.email } },
		operation: 'requestAccountDeletion',
	});
}
