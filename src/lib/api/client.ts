import { API_KEY, API_TIMEOUT_MS, API_URL } from 'astro:env/server';

/**
 * Minimal GraphQL client for the MarketDay API — raw `fetch`, no SDK, matching how the
 * rest of this repo talks to third-party HTTP.
 *
 * Every request carries the shared `x-api-key` the API's global `ApiKeyGuard` checks
 * (`backend/src/common/guards/api-key.guard.ts`). It is a server-only secret: it must never
 * reach `astro:env/client` or the markup.
 *
 * The public pages hold no user session. The vendor portal (`/vendor/*`) does: its tokens
 * live in httpOnly cookies (`src/lib/auth/`) and are passed in here as `accessToken`, so a
 * user's JWT, like the API key, only ever travels server to server.
 */

export interface GraphQLOperation {
	/** The document to send. One operation per document. */
	query: string;
	variables?: Record<string, unknown>;
	/**
	 * Root field name, used to pick the result out of `data` and to tag log lines.
	 * Kept explicit rather than parsed out of the document.
	 */
	operation: string;
	/** Sent as `Authorization: Bearer`. Only the vendor portal passes one. */
	accessToken?: string;
}

/**
 * Every failure mode — transport, HTTP status, GraphQL `errors` — arrives as this one type.
 * Callers are expected to log it and return a generic message; the `message` here can carry
 * API detail and must not be forwarded to the browser.
 */
export class ApiError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/**
 * Thrown specifically when the API's GraphQL response carried an `errors[]` array — as
 * opposed to a transport failure, a non-2xx status, or a malformed body. The distinction
 * matters to `confirmAccountDeletion`'s action handler and the vendor portal's actions
 * (`src/actions/vendor-portal.ts`): a GraphQL business error is application text a resolver
 * deliberately threw, never a stack trace, an HTML error page, or infrastructure detail, so
 * it is safe to show a user almost verbatim (as is `GraphQLAuthError`, below). Every other
 * variant must still be treated as opaque.
 */
export class GraphQLBusinessError extends ApiError {
	constructor(
		message: string,
		/** The GraphQL error text alone, with no `${operation}: ` prefix — this is what's safe to show. */
		readonly detail: string,
		status?: number,
		/**
		 * The HTTP status of the exception the resolver threw, which Nest copies onto
		 * `extensions.originalError.statusCode`. The response itself was a 200 (see
		 * `backend/src/common/graphql/auth-http-status.plugin.ts`), so this is the only place a
		 * 503 "billing is switched off" can be told from a 400 refusal.
		 */
		readonly resolverStatus?: number,
	) {
		super(message, status);
		this.name = 'GraphQLBusinessError';
	}
}

/**
 * A 401 or 403 carrying GraphQL `errors`. The API gives auth refusals a real HTTP status
 * (`backend/src/common/graphql/auth-http-status.plugin.ts`), and their sentences are a
 * contract its apps show verbatim (`backend/src/auth/domain/auth.errors.ts`: wrong
 * password, lockout countdown, suspension), so `detail` is safe to show.
 *
 * Deliberately not a `GraphQLBusinessError`: `deleteAccount.confirm` forwards those, and a
 * public page has no business echoing an auth refusal. An API-key rejection never becomes
 * one of these — see `authRefusal` below.
 */
export class GraphQLAuthError extends ApiError {
	constructor(
		message: string,
		readonly detail: string,
		status: number,
	) {
		super(message, status);
		this.name = 'GraphQLAuthError';
	}
}

/**
 * The API rejected the document itself (`GRAPHQL_VALIDATION_FAILED`) — it names a field the
 * running API doesn't have. That is how the vendor portal tells "this operation hasn't
 * shipped yet" from "this operation failed" (see `src/lib/api/vendor-billing.ts`). The
 * message names schema fields, so it is never shown.
 */
export class ApiOperationUnavailable extends ApiError {
	constructor(message: string, status?: number) {
		super(message, status);
		this.name = 'ApiOperationUnavailable';
	}
}

interface GraphQLErrorEntry {
	message?: string;
	extensions?: { code?: unknown; originalError?: { statusCode?: unknown } };
}

interface GraphQLResponse<T> {
	data?: T | null;
	errors?: GraphQLErrorEntry[];
}

/** Bounds what ends up in the logs when the API answers with an HTML error page. */
function truncate(value: string, max = 500): string {
	return value.length > max ? `${value.slice(0, max)}…` : value;
}

/**
 * The API key guard answers 401 too ("Invalid API key", "API key not configured"). That is a
 * deployment fault, not something to tell a vendor on the sign-in form, so it stays opaque.
 */
function authRefusal(operation: string, detail: string, status: number): ApiError {
	if (/\bAPI key\b/i.test(detail)) {
		return new ApiError(`${operation}: API key rejected — ${detail}`, status);
	}
	return new GraphQLAuthError(`${operation}: ${detail}`, detail, status);
}

function parseBody(raw: string): GraphQLResponse<Record<string, unknown>> | null {
	try {
		return JSON.parse(raw) as GraphQLResponse<Record<string, unknown>>;
	} catch {
		return null;
	}
}

function authHeader(): Record<string, string> {
	if (API_KEY) return { 'x-api-key': API_KEY };

	// The API leaves the gate open when it has no key configured, so a local checkout
	// still works unconfigured. In production a missing key means every submission 401s,
	// which must fail loudly rather than look like a broken form.
	if (import.meta.env.PROD) {
		throw new ApiError('API_KEY is not set');
	}
	console.warn('[api] API_KEY is unset — sending requests unauthenticated');
	return {};
}

/**
 * Executes one GraphQL operation and returns its root field value.
 *
 * Throws `ApiError` for anything short of a clean result, including a `200` carrying
 * `errors` — GraphQL reports application failures with a success status, so the body is
 * what decides, not the code.
 */
export async function graphqlRequest<T>({
	query,
	variables,
	operation,
	accessToken,
}: GraphQLOperation): Promise<T> {
	let response: Response;
	try {
		response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json',
				...authHeader(),
				...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
			},
			body: JSON.stringify({ query, variables }),
			// Without this the request can outlive the serverless invocation's own budget and
			// the visitor watches a spinner until the platform kills the function.
			signal: AbortSignal.timeout(API_TIMEOUT_MS),
		});
	} catch (error) {
		if (error instanceof ApiError) throw error;
		const reason = error instanceof Error ? error.message : String(error);
		throw new ApiError(`${operation}: request to the API failed (${reason})`);
	}

	const raw = await response.text();
	const payload = parseBody(raw);
	const errors = payload?.errors ?? [];
	const detail = truncate(errors.map((error) => error.message ?? 'unknown error').join('; '));

	// Checked before the status: Apollo answers a document it can't validate with a 400.
	if (errors.some((error) => error.extensions?.code === 'GRAPHQL_VALIDATION_FAILED')) {
		throw new ApiOperationUnavailable(`${operation}: ${detail}`, response.status);
	}

	if (!response.ok) {
		if (errors.length && (response.status === 401 || response.status === 403)) {
			throw authRefusal(operation, detail, response.status);
		}
		throw new ApiError(`${operation}: API responded ${response.status} — ${truncate(raw)}`, response.status);
	}

	if (!payload) {
		throw new ApiError(`${operation}: API returned a non-JSON body — ${truncate(raw)}`, response.status);
	}

	if (errors.length) {
		const resolverStatus = errors[0].extensions?.originalError?.statusCode;
		throw new GraphQLBusinessError(
			`${operation}: ${detail}`,
			detail,
			response.status,
			typeof resolverStatus === 'number' ? resolverStatus : undefined,
		);
	}

	const data = payload.data?.[operation];
	if (data === undefined || data === null) {
		throw new ApiError(`${operation}: API returned no data`, response.status);
	}

	return data as T;
}
