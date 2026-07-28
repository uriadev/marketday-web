import { graphqlRequest } from './client';

export interface AccountDeletionRequestInput {
	/** The address the visitor typed, lowercased. Never looked up here — the API decides. */
	email: string;
}

/**
 * Confirmed against the API schema (`backend/src/schema.gql`) — see
 * `AccountDeletionLinkResolver.requestAccountDeletionLink`
 * (`backend/src/account/account-deletion-link.resolver.ts`), which is `@Public()` so
 * it's reachable without a JWT via the shared `x-api-key`.
 *
 * This is the unauthenticated, email-a-link request from the public site, not the
 * in-app `deleteAccount` mutation (which is JWT-guarded and irreversible); they are
 * separate operations. The resolver always returns `true`, whether or not the email
 * belongs to an account, so this never reveals account existence.
 */
const REQUEST_ACCOUNT_DELETION_LINK = /* GraphQL */ `
	mutation RequestAccountDeletionLink($input: RequestAccountDeletionLinkInput!) {
		requestAccountDeletionLink(input: $input)
	}
`;

/** Resolves on success; throws `ApiError` otherwise. */
export async function requestAccountDeletion(input: AccountDeletionRequestInput): Promise<void> {
	await graphqlRequest({
		query: REQUEST_ACCOUNT_DELETION_LINK,
		variables: { input: { email: input.email } },
		operation: 'requestAccountDeletionLink',
	});
}
