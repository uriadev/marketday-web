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

/**
 * Confirmed against `AccountDeletionLinkResolver.accountDeletionLinkValid`, `@Public()`.
 * Checks the token without spending it (`AccountDeletionLinkService.isLinkValid`), so the
 * page can render an "expired" state instead of a confirm button that would fail on click.
 * `false` covers "never existed", "expired", and "already used" identically — the API
 * doesn't distinguish them, so neither does this.
 */
const ACCOUNT_DELETION_LINK_VALID = /* GraphQL */ `
	query AccountDeletionLinkValid($input: AccountDeletionLinkInput!) {
		accountDeletionLinkValid(input: $input)
	}
`;

/** Resolves `true`/`false`; throws `ApiError` for anything short of a clean answer. */
export async function checkAccountDeletionLink(token: string): Promise<boolean> {
	return graphqlRequest<boolean>({
		query: ACCOUNT_DELETION_LINK_VALID,
		variables: { input: { token } },
		operation: 'accountDeletionLinkValid',
	});
}

/**
 * Confirmed against `AccountDeletionLinkResolver.confirmAccountDeletion`, `@Public()`.
 * Spends the token and deletes the account synchronously, in one backend transaction
 * (`AccountDeletionService.run` → `purge`) — this is instant, not queued for review, and
 * irreversible.
 *
 * Unlike `requestAccountDeletion`, a failure here is often safe to show almost verbatim to
 * the account holder: every throw in this resolver's call chain
 * (`invalidDeletionLink()`, `assertNoOpenOrders`, `assertNoOtherMembers` in
 * `backend/src/account/account-deletion.service.ts`) is a deliberately-authored
 * `BadRequestException` meant to be read by a person, not a stack trace. See
 * `GraphQLBusinessError` in `./client` and the `confirm` action in `src/actions/index.ts`
 * for exactly which failures get forwarded and which stay generic.
 */
const CONFIRM_ACCOUNT_DELETION = /* GraphQL */ `
	mutation ConfirmAccountDeletion($input: AccountDeletionLinkInput!) {
		confirmAccountDeletion(input: $input)
	}
`;

export async function confirmAccountDeletion(token: string): Promise<void> {
	await graphqlRequest({
		query: CONFIRM_ACCOUNT_DELETION,
		variables: { input: { token } },
		operation: 'confirmAccountDeletion',
	});
}
