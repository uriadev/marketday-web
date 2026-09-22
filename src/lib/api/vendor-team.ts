import { graphqlRequest } from './client';
import type { VendorMemberRole } from './vendor-auth';

/**
 * A vendor's team, as its owner manages it. Confirmed against `backend/src/schema.gql` and
 * `VendorMembersResolver` (`backend/src/vendors/infrastructure/graphql/vendor-members.resolver.ts`).
 *
 * Every operation here is owner-only, enforced by the API (`assertOwner`), and an owner
 * never passes `vendorId` — the API reads it from the caller's own seat. Staff are always
 * pinned to one market; the owner covers them all.
 *
 * Refusals (staff limit per market, invite throttles, removing the owner) are deliberately
 * authored sentences and arrive as `GraphQLBusinessError`, safe to show the owner.
 */

export interface MarketRef {
	id: string;
	name: string;
}

export interface VendorMember {
	userId: string;
	role: VendorMemberRole;
	email: string;
	fullName: string;
	marketId: string | null;
	market: MarketRef | null;
	createdAt: string;
}

export interface VendorInvite {
	id: string;
	email: string;
	marketId: string;
	market: MarketRef | null;
	createdAt: string;
	expiresAt: string;
}

export interface VendorStall {
	marketId: string;
	market: MarketRef;
}

const VENDOR_MEMBERS = /* GraphQL */ `
	query VendorPortalMembers {
		vendorMembers {
			userId
			role
			email
			fullName
			marketId
			market {
				id
				name
			}
			createdAt
		}
	}
`;

export async function listMembers(accessToken: string): Promise<VendorMember[]> {
	return graphqlRequest<VendorMember[]>({ query: VENDOR_MEMBERS, operation: 'vendorMembers', accessToken });
}

/** Invites expire after 15 minutes, so this list is usually short-lived. */
const PENDING_INVITES = /* GraphQL */ `
	query VendorPortalPendingInvites {
		pendingVendorInvites {
			id
			email
			marketId
			market {
				id
				name
			}
			createdAt
			expiresAt
		}
	}
`;

export async function listInvites(accessToken: string): Promise<VendorInvite[]> {
	return graphqlRequest<VendorInvite[]>({
		query: PENDING_INVITES,
		operation: 'pendingVendorInvites',
		accessToken,
	});
}

/** The markets the vendor trades at — what a staff member can be pinned to. */
const MY_VENDOR_MARKETS = /* GraphQL */ `
	query VendorPortalMarkets {
		myVendorMarkets {
			marketId
			market {
				id
				name
			}
		}
	}
`;

export async function listMyMarkets(accessToken: string): Promise<VendorStall[]> {
	return graphqlRequest<VendorStall[]>({ query: MY_VENDOR_MARKETS, operation: 'myVendorMarkets', accessToken });
}

/**
 * Emails a 6-digit code to the address. The invitee creates an account (or signs in) in the
 * app and enters it there. A second invite to the same address supersedes the first, which
 * is what "Resend code" relies on.
 */
const INVITE_MEMBER = /* GraphQL */ `
	mutation VendorPortalInviteMember($input: InviteVendorMemberInput!) {
		inviteVendorMember(input: $input)
	}
`;

export async function inviteMember(accessToken: string, email: string, marketId: string): Promise<void> {
	await graphqlRequest({
		query: INVITE_MEMBER,
		variables: { input: { email, marketId } },
		operation: 'inviteVendorMember',
		accessToken,
	});
}

const REVOKE_INVITE = /* GraphQL */ `
	mutation VendorPortalRevokeInvite($id: ID!) {
		revokeVendorInvite(id: $id)
	}
`;

export async function revokeInvite(accessToken: string, id: string): Promise<void> {
	await graphqlRequest({ query: REVOKE_INVITE, variables: { id }, operation: 'revokeVendorInvite', accessToken });
}

const MOVE_MEMBER = /* GraphQL */ `
	mutation VendorPortalMoveMember($input: UpdateVendorMemberInput!) {
		updateVendorMember(input: $input) {
			userId
		}
	}
`;

export async function moveMember(accessToken: string, userId: string, marketId: string): Promise<void> {
	await graphqlRequest({
		query: MOVE_MEMBER,
		variables: { input: { userId, marketId } },
		operation: 'updateVendorMember',
		accessToken,
	});
}

/** The removed person keeps their account, demoted to a plain shopper. */
const REMOVE_MEMBER = /* GraphQL */ `
	mutation VendorPortalRemoveMember($userId: ID!) {
		removeVendorMember(userId: $userId)
	}
`;

export async function removeMember(accessToken: string, userId: string): Promise<void> {
	await graphqlRequest({
		query: REMOVE_MEMBER,
		variables: { userId },
		operation: 'removeVendorMember',
		accessToken,
	});
}
