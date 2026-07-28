import { API_KEY, API_TIMEOUT_MS, API_URL } from 'astro:env/server';

/**
 * Minimal GraphQL client for the MarketDay API — raw `fetch`, no SDK, matching how the
 * rest of this repo talks to third-party HTTP.
 *
 * The site never holds a user session, so the only credential is the shared `x-api-key`
 * the API's global `ApiKeyGuard` checks (`backend/src/common/guards/api-key.guard.ts`).
 * It is a server-only secret: it must never reach `astro:env/client` or the markup.
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

interface GraphQLResponse<T> {
	data?: T | null;
	errors?: { message?: string }[];
}

/** Bounds what ends up in the logs when the API answers with an HTML error page. */
function truncate(value: string, max = 500): string {
	return value.length > max ? `${value.slice(0, max)}…` : value;
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
export async function graphqlRequest<T>({ query, variables, operation }: GraphQLOperation): Promise<T> {
	let response: Response;
	try {
		response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json',
				...authHeader(),
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

	if (!response.ok) {
		throw new ApiError(`${operation}: API responded ${response.status} — ${truncate(raw)}`, response.status);
	}

	let payload: GraphQLResponse<Record<string, unknown>>;
	try {
		payload = JSON.parse(raw) as GraphQLResponse<Record<string, unknown>>;
	} catch {
		throw new ApiError(`${operation}: API returned a non-JSON body — ${truncate(raw)}`, response.status);
	}

	if (payload.errors?.length) {
		const detail = payload.errors.map((error) => error.message ?? 'unknown error').join('; ');
		throw new ApiError(`${operation}: ${truncate(detail)}`, response.status);
	}

	const data = payload.data?.[operation];
	if (data === undefined || data === null) {
		throw new ApiError(`${operation}: API returned no data`, response.status);
	}

	return data as T;
}
