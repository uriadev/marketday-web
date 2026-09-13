import { RRule, rrulestr } from 'rrule';
import type { Market } from '../../data/markets';
import { addDays, dublinDate, tradingDays, type TradingDay } from '../markets';
import { graphqlRequest } from './client';

/**
 * Confirmed against the API schema (`backend/src/schema.gql`) and `MarketsResolver.markets`,
 * which is `@Public()`. With no `criteria` it goes through `MarketsService.findAll` →
 * `filterPublic`, which always ANDs in `status = PUBLISHED`, so a draft can never reach this
 * page whatever arguments are sent. `isActive: true` additionally hides paused markets.
 */
const PUBLISHED_MARKETS = /* GraphQL */ `
	query PublishedMarkets {
		markets(isActive: true) {
			slug
			name
			address
			city
			location
			schedule
			duration
			imageUrl
			tags
		}
	}
`;

interface ApiMarket {
	slug: string;
	name: string;
	address: string;
	city: string;
	/** GeoJSON point, `coordinates: [longitude, latitude]`. Nullable in the schema. */
	location: { type?: string; coordinates?: unknown } | null;
	/** `DTSTART` + `RRULE` (RFC 5545), e.g. `FREQ=WEEKLY;BYDAY=SA;BYHOUR=9;BYMINUTE=0`. */
	schedule: string;
	/** Minutes from opening to close. */
	duration: number;
	imageUrl: string | null;
	tags: string[] | null;
}

/** How far ahead `Market.upcoming` looks — enough to cover a monthly market's next date. */
const UPCOMING_DAYS = 62;

/** Stands in for a missing `DTSTART` — the same anchor `backend/seed` counts schedules from. */
const SCHEDULE_ANCHOR = new Date('2026-01-01T00:00:00Z');

/**
 * Fetches every published, active market and maps it onto the finder's `Market`, ordered by
 * next trading date. Throws `ApiError` if the API can't be reached; a single market the page
 * can't place (no location, a schedule it can't read) is skipped and logged instead, so one
 * bad row can't take the whole finder down.
 */
export async function fetchMarkets(): Promise<Market[]> {
	const rows = await graphqlRequest<ApiMarket[]>({
		query: PUBLISHED_MARKETS,
		operation: 'markets',
	});

	const markets: Market[] = [];
	for (const row of rows) {
		try {
			markets.push(toMarket(row));
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			console.warn(`[markets] skipping "${row.slug}": ${reason}`);
		}
	}

	// Soonest first; a market whose rule has no date in the window sorts last.
	const nextDate = (market: Market) => market.upcoming[0] ?? '9999-12-31';
	return markets.sort((a, b) => nextDate(a).localeCompare(nextDate(b)) || a.name.localeCompare(b.name));
}

function toMarket(row: ApiMarket): Market {
	const [longitude, latitude] = parseLocation(row.location);
	const schedule = parseSchedule(row.schedule, row.duration);
	const city = row.city.trim();
	const address = row.address.trim();

	return {
		slug: row.slug,
		name: row.name,
		address: !city || address.toLowerCase().includes(city.toLowerCase()) ? address : `${address}, ${city}`,
		city,
		latitude,
		longitude,
		...schedule,
		tags: (row.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
		imageUrl: parseImageUrl(row.imageUrl),
	};
}

/** GeoJSON is `[longitude, latitude]` — reading it the other way round moves Cork to the Indian Ocean. */
function parseLocation(location: ApiMarket['location']): [number, number] {
	const coordinates = location?.coordinates;
	if (!Array.isArray(coordinates) || coordinates.length < 2) throw new Error('no location');

	const [longitude, latitude] = coordinates;
	if (
		typeof longitude !== 'number' ||
		typeof latitude !== 'number' ||
		Math.abs(latitude) > 90 ||
		Math.abs(longitude) > 180
	) {
		throw new Error('location is not a valid point');
	}
	return [longitude, latitude];
}

/**
 * Only an absolute http(s) URL becomes an `<img src>`. An admin types this in the console, so
 * anything else — a relative path, a `data:` or `javascript:` URL — falls back to the default photo.
 */
function parseImageUrl(value: string | null): string | undefined {
	if (!value) return undefined;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
	} catch {
		return undefined;
	}
}

type ScheduleFields = Pick<Market, 'days' | 'cadence' | 'opens' | 'closes' | 'upcoming'>;

/**
 * Reads the day, hours and upcoming dates out of the market's RRULE.
 *
 * The API stores Irish wall-clock numerals as if they were UTC (`T090000Z` means 09:00 in Cork
 * all year — see `backend/src/markets/market-time-zone.ts`), so every date the rule yields is read
 * back with the `UTC` accessors and never converted.
 */
function parseSchedule(schedule: string, duration: number): ScheduleFields {
	// Some rows carry a bare RRULE with no DTSTART. rrule would then anchor on the current second,
	// which drops today's occurrence once its opening time has passed and stamps stray seconds on
	// every date. A fixed midnight anchor avoids both — but only when DTSTART is missing, since the
	// option overrides one in the string and that would shift a fortnightly market's phase.
	const rule = /^DTSTART/im.test(schedule) ? rrulestr(schedule) : rrulestr(schedule, { dtstart: SCHEDULE_ANCHOR });
	if (!(rule instanceof RRule)) throw new Error('schedule is not a single rule');
	const { options } = rule;

	// rrule normalises BYDAY into `byweekday` (plain weekdays, Monday = 0 like `tradingDays`) and
	// `bynweekday` (`[weekday, n]` pairs, e.g. the 2nd Saturday). A weekly rule with no BYDAY at
	// all comes back with DTSTART's weekday filled in.
	const nthWeekdays = options.bynweekday ?? [];
	const weekdayIndexes = [...(options.byweekday ?? []), ...nthWeekdays.map(([weekday]) => weekday)];
	const days = tradingDays.filter((_, index) => weekdayIndexes.includes(index));
	if (days.length === 0) throw new Error('schedule has no weekday');

	const openMinutes = (options.byhour?.[0] ?? 0) * 60 + (options.byminute?.[0] ?? 0);
	// A market can't trade past midnight on this page's model; clamp rather than wrap to 00:xx.
	const closeMinutes = Math.min(openMinutes + Math.max(duration, 0), 23 * 60 + 59);

	const today = dublinDate();
	const from = new Date(`${today}T00:00:00Z`);
	const to = new Date(`${addDays(today, UPCOMING_DAYS)}T00:00:00Z`);
	const upcoming = [
		...new Set(rule.between(from, to, true).map((date) => date.toISOString().slice(0, 10))),
	];

	return {
		days,
		cadence: describeCadence(options.freq, options.interval, days, nthWeekdays),
		opens: formatTime(openMinutes),
		closes: formatTime(closeMinutes),
		upcoming,
	};
}

function describeCadence(
	freq: number,
	interval: number,
	days: TradingDay[],
	nthWeekdays: number[][],
): string {
	const dayList = days.join(' & ');

	if (freq === RRule.MONTHLY && nthWeekdays.length === 1) {
		const [weekday, n] = nthWeekdays[0];
		const which = n === -1 ? 'Last' : ordinal(n);
		return `${which} ${tradingDays[weekday]} of the month`;
	}
	if (freq === RRule.WEEKLY && interval === 2) return `Every other ${dayList}`;
	if (freq === RRule.WEEKLY && interval > 2) return `Every ${interval} weeks, ${dayList}`;
	return dayList;
}

function ordinal(n: number): string {
	const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th');
	return `${n}${suffix}`;
}

function formatTime(minutes: number): string {
	const pad = (value: number) => String(value).padStart(2, '0');
	return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}
