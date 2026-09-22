import { graphqlRequest } from './client';

/**
 * Sign-in for the vendor portal, confirmed against `backend/src/schema.gql` and
 * `AuthResolver` (`backend/src/auth/infrastructure/graphql/auth.resolver.ts`).
 *
 * Every sign-in opens its own per-device session on the API (`user_sessions`), so signing
 * in here never signs the same person out of the app, and `logOut` ends only this one.
 */

export type UserRole = 'BUYER' | 'VENDOR' | 'ADMIN';
export type VendorMemberRole = 'OWNER' | 'STAFF';

/** The seat fields are absent for a buyer, not null — hence optional. */
export interface AuthUser {
	id: string;
	email: string;
	fullName: string;
	role: UserRole;
	vendorId?: string | null;
	vendorRole?: VendorMemberRole | null;
}

export interface AuthSession {
	accessToken: string;
	refreshToken: string;
	user: AuthUser;
}

export interface PortalProfile extends AuthUser {
	vendor?: { id: string; name: string } | null;
}

const AUTH_FIELDS = /* GraphQL */ `
	accessToken
	refreshToken
	user {
		id
		email
		fullName
		role
		vendorId
		vendorRole
	}
`;

const LOGIN = /* GraphQL */ `
	mutation VendorPortalLogin($input: LoginInput!) {
		login(input: $input) { ${AUTH_FIELDS} }
	}
`;

/** Refusals ("Invalid credentials", the lockout countdown) arrive as `GraphQLAuthError`. */
export async function logIn(email: string, password: string): Promise<AuthSession> {
	return graphqlRequest<AuthSession>({
		query: LOGIN,
		variables: { input: { email, password } },
		operation: 'login',
	});
}

/**
 * The ID token's audience must be the API's `GOOGLE_CLIENT_ID` — the same web client this
 * site renders its button with. An unknown email gets a new BUYER account, which the portal
 * then turns away as "not linked to a vendor".
 */
const GOOGLE_AUTH = /* GraphQL */ `
	mutation VendorPortalGoogleAuth($input: GoogleAuthInput!) {
		googleAuth(input: $input) { ${AUTH_FIELDS} }
	}
`;

export async function googleSignIn(idToken: string): Promise<AuthSession> {
	return graphqlRequest<AuthSession>({
		query: GOOGLE_AUTH,
		variables: { input: { idToken } },
		operation: 'googleAuth',
	});
}

/**
 * The API reads the refresh token from `Authorization: Bearer` (`JwtRefreshGuard`), not
 * from the input — the argument is required by the schema but ignored, so it is sent anyway.
 *
 * Rotates on every call: the old refresh token stops working. Of two refreshes racing with
 * one token exactly one wins; the loser gets a plain 401 and the session survives.
 */
const REFRESH = /* GraphQL */ `
	mutation VendorPortalRefresh($input: RefreshTokenInput!) {
		refreshToken(input: $input) { ${AUTH_FIELDS} }
	}
`;

export async function refreshSession(refreshToken: string): Promise<AuthSession> {
	return graphqlRequest<AuthSession>({
		query: REFRESH,
		variables: { input: { refreshToken } },
		operation: 'refreshToken',
		accessToken: refreshToken,
	});
}

const LOGOUT = /* GraphQL */ `
	mutation VendorPortalLogout {
		logout
	}
`;

/** Ends this device's session only. */
export async function logOut(accessToken: string): Promise<void> {
	await graphqlRequest({ query: LOGOUT, operation: 'logout', accessToken });
}

const ME = /* GraphQL */ `
	query VendorPortalMe {
		me {
			id
			email
			fullName
			role
			vendorId
			vendorRole
			vendor {
				id
				name
			}
		}
	}
`;

export async function getMe(accessToken: string): Promise<PortalProfile> {
	return graphqlRequest<PortalProfile>({ query: ME, operation: 'me', accessToken });
}

/**
 * Always resolves `true`, whether or not the email has an account, so nothing here reveals
 * one. A Google- or Apple-only account is emailed a "sign in with …" note instead of a code.
 */
const REQUEST_PASSWORD_RESET = /* GraphQL */ `
	mutation VendorPortalRequestPasswordReset($input: RequestPasswordResetInput!) {
		requestPasswordReset(input: $input)
	}
`;

export async function requestPasswordReset(email: string): Promise<void> {
	await graphqlRequest({
		query: REQUEST_PASSWORD_RESET,
		variables: { input: { email } },
		operation: 'requestPasswordReset',
	});
}

/**
 * Spends the emailed 6-digit code (15 minutes, 5 attempts). Every failure is one generic
 * `GraphQLBusinessError`, so it is safe to show. A successful reset ends every session the
 * account had, on every device.
 */
const RESET_PASSWORD = /* GraphQL */ `
	mutation VendorPortalResetPassword($input: ResetPasswordInput!) {
		resetPassword(input: $input)
	}
`;

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
	await graphqlRequest({
		query: RESET_PASSWORD,
		variables: { input: { email, code, newPassword } },
		operation: 'resetPassword',
	});
}
