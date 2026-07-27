/**
 * Best-effort in-process fixed-window rate limiter.
 *
 * Deliberately dependency-free. The trade-off: state lives in one serverless instance, so a
 * caller spread across cold starts gets a higher effective limit than the configured one.
 * That is acceptable here — this is a marketing contact form whose real bot gates are the
 * honeypot and the fill-time check; the limiter exists to cap the damage from a single
 * source hammering one warm instance. Swap in Upstash/Vercel KV if the limit ever needs to
 * be exact.
 */

interface Window {
	count: number;
	resetAt: number;
}

/** Bounds memory on a long-lived instance; entries are also pruned as they expire. */
const MAX_TRACKED_KEYS = 5000;

const windows = new Map<string, Window>();

export interface RateLimitResult {
	allowed: boolean;
	/** Seconds until the current window resets. Suitable for a Retry-After hint. */
	retryAfterSeconds: number;
}

function prune(now: number): void {
	for (const [key, window] of windows) {
		if (window.resetAt <= now) windows.delete(key);
	}
	if (windows.size <= MAX_TRACKED_KEYS) return;
	// Still over budget after pruning: drop oldest-inserted keys (Map preserves insertion order).
	const excess = windows.size - MAX_TRACKED_KEYS;
	let dropped = 0;
	for (const key of windows.keys()) {
		if (dropped++ >= excess) break;
		windows.delete(key);
	}
}

export function checkRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
	const now = Date.now();
	prune(now);

	const existing = windows.get(key);
	if (!existing || existing.resetAt <= now) {
		windows.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfterSeconds: 0 };
	}

	existing.count += 1;
	if (existing.count > max) {
		return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
	}
	return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Resolve the caller's IP from proxy headers.
 *
 * Order matters. `x-vercel-forwarded-for` and `x-real-ip` are set by the platform and
 * overwrite whatever the client sent. `x-forwarded-for` is only trustworthy behind such a
 * proxy — its first hop is client-supplied on a bare Node server — so it is the last resort,
 * and callers should treat the result as a throttling key rather than an identity.
 */
export function getClientIp(request: Request): string {
	const platformIp =
		request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-real-ip');
	if (platformIp) return platformIp.trim();

	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		const [first] = forwardedFor.split(',');
		if (first?.trim()) return first.trim();
	}

	return 'unknown';
}
