/**
 * Formatting for the vendor portal, shared by the server-rendered sections and their
 * browser scripts. Like `src/lib/markets.ts`, it must stay importable in the browser: no
 * `astro:env/server`, no API client.
 */

const DUBLIN = 'Europe/Dublin';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Integer minor units (cents) → "€10.00". */
export function formatMoney(amountMinor: number, currency: string): string {
	return new Intl.NumberFormat('en-IE', { style: 'currency', currency: currency.toUpperCase() }).format(
		amountMinor / 100,
	);
}

/** "3 Oct 2026", on the Dublin calendar. */
export function formatDate(iso: string | null | undefined): string {
	if (!iso) return '';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: DUBLIN }).format(
		date,
	);
}

/** "14:05", on the Dublin clock. */
export function formatTime(iso: string | null | undefined): string {
	if (!iso) return '';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat('en-IE', { hour: '2-digit', minute: '2-digit', timeZone: DUBLIN }).format(date);
}

/** Whole days from now until `iso`, rounded up; 0 once it has passed. */
export function daysUntil(iso: string | null | undefined, now = Date.now()): number {
	if (!iso) return 0;
	const at = new Date(iso).getTime();
	if (Number.isNaN(at)) return 0;
	return Math.max(0, Math.ceil((at - now) / DAY_MS));
}

export function pluralise(count: number, one: string, many = `${one}s`): string {
	return `${count} ${count === 1 ? one : many}`;
}
