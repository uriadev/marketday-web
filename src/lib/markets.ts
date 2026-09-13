/**
 * Market helpers shared by the build (`src/data/markets.ts`, the market components) and the
 * finder script that runs in the browser. Kept apart from the data module so the script's bundle
 * doesn't pull in the market images that module imports.
 */

/** ISO order (Monday first). These are also what `Intl`'s `weekday: 'short'` yields in en-GB. */
export const tradingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type TradingDay = (typeof tradingDays)[number];

export const tradingDayNames: Record<TradingDay, string> = {
	Mon: 'Monday',
	Tue: 'Tuesday',
	Wed: 'Wednesday',
	Thu: 'Thursday',
	Fri: 'Friday',
	Sat: 'Saturday',
	Sun: 'Sunday',
};

export interface Coordinates {
	latitude: number;
	longitude: number;
}

/** Great-circle (haversine) distance in kilometres. */
export function distanceKm(from: Coordinates, to: Coordinates): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(to.latitude - from.latitude);
	const dLng = toRad(to.longitude - from.longitude);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLng / 2) ** 2;
	return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export function formatDistance(km: number): string {
	return `${km.toFixed(1)} km`;
}

export function countLabel(count: number): string {
	return count === 1 ? '1 market' : `${count} markets`;
}

// en-CA formats a calendar date as `YYYY-MM-DD`, the same shape the server writes into a card's
// `data-dates`, so the two compare as plain strings.
const dublinDateFormat = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Europe/Dublin',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

/** The calendar date in Ireland at `date`, as `YYYY-MM-DD`. Markets trade on Irish time. */
export function dublinDate(date = new Date()): string {
	return dublinDateFormat.format(date);
}

/** The weekday a `YYYY-MM-DD` calendar date falls on. */
export function weekdayOf(isoDate: string): TradingDay {
	// Noon UTC stays on the same calendar date whatever the offset; getUTCDay counts from Sunday.
	return tradingDays[(new Date(`${isoDate}T12:00:00Z`).getUTCDay() + 6) % 7];
}

/** Shifts a `YYYY-MM-DD` date by whole days. Done in UTC, so no clock change can skip or repeat a day. */
export function addDays(isoDate: string, days: number): string {
	const [year, month, day] = isoDate.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}
