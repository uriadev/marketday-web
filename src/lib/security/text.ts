/**
 * Text hardening helpers for anything that crosses a trust boundary — the outbound email
 * body (HTML injection) and SMTP/API headers (header injection).
 *
 * Nothing here tries to "clean" input into something safe to interpolate raw. The rule is
 * the opposite: normalise first, then escape at the point of use.
 */

const TAB = 0x09;
const LINE_FEED = 0x0a;

/**
 * Invisible and bidirectional-override code points. This is the "Trojan Source" class:
 * they render as nothing, or reorder the text around them, so what a moderator reads in
 * the inbox can differ from the bytes that were submitted.
 */
const INVISIBLE_RANGES: ReadonlyArray<readonly [number, number]> = [
	[0x200b, 0x200f], // zero-width space/non-joiner/joiner, LTR & RTL marks
	[0x202a, 0x202e], // bidi embeddings and overrides
	[0x2060, 0x2064], // word joiner, invisible operators
	[0x2066, 0x2069], // bidi isolates
	[0xfeff, 0xfeff], // byte order mark / zero-width no-break space
];

/** C0/C1 control characters. Tab and newline are excluded — both are valid in a message body. */
function isControlCodePoint(code: number): boolean {
	if (code === TAB || code === LINE_FEED) return false;
	return code < 0x20 || (code >= 0x7f && code <= 0x9f);
}

function isInvisibleCodePoint(code: number): boolean {
	return INVISIBLE_RANGES.some(([start, end]) => code >= start && code <= end);
}

/** Iterates by code point, so astral characters (emoji) survive intact. */
function stripUnsafeCodePoints(value: string): string {
	let result = '';
	for (const char of value) {
		const code = char.codePointAt(0);
		if (code === undefined) continue;
		if (isControlCodePoint(code) || isInvisibleCodePoint(code)) continue;
		result += char;
	}
	return result;
}

const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

/**
 * Escape a string for interpolation into HTML text content or a double-quoted attribute.
 *
 * Every user-controlled value in the email template must go through this. The templates
 * build HTML by concatenation, so unlike an Astro or React tree there is no automatic
 * escaping to fall back on.
 */
export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/**
 * Normalise free text: canonical Unicode form, no control or invisible characters,
 * consistent newlines, no runaway blank-line padding.
 *
 * NFC runs first so that length checks and the invisible-character strip both operate on
 * a single canonical representation.
 */
export function normalizeText(value: string): string {
	const normalized = stripUnsafeCodePoints(value.normalize('NFC').replace(/\r\n?/g, '\n'));
	return normalized
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/**
 * Collapse a value to a single safe header line.
 *
 * Newlines are the payload in email header injection — a subject containing
 * "\nBcc: victim@example.com" turns one message into a relay. Both senders encode headers
 * for us, but stripping here means a bug in either one can't become a vulnerability.
 */
export function sanitizeHeaderValue(value: string, maxLength = 200): string {
	const collapsed = stripUnsafeCodePoints(value.normalize('NFC').replace(/[\r\n]+/g, ' '));
	return collapsed.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

/** Count explicit links in a body. A bulk-spam heuristic, not validation. */
export function countLinks(value: string): number {
	return (value.match(/\b(?:https?:\/\/|www\.)\S+/gi) ?? []).length;
}
