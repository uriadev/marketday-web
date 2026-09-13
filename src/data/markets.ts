import type { Coordinates, TradingDay } from '../lib/markets';
import { addDays, dublinDate } from '../lib/markets';
import fallbackImage from '../assets/marketday/market-1.png';

/**
 * A market as the finder renders it. The list itself comes from the MarketDay API on each
 * (CDN-cached) request — see `src/lib/api/markets.ts`, which maps the API's shape onto this one.
 */
export interface Market extends Coordinates {
	/** Card anchor (`#market-<slug>`), and how the finder script pairs a card with its map pin. */
	slug: string;
	name: string;
	address: string;
	city: string;
	/** Weekdays the schedule trades on — usually one. What the day filter matches on. */
	days: TradingDay[];
	/** How often it trades, e.g. `Sat`, `Every other Sat`, `2nd Sat of the month`. */
	cadence: string;
	/** 24-hour Irish local time, `HH:MM` — the finder script compares these as strings. */
	opens: string;
	closes: string;
	/**
	 * Upcoming trading dates in Ireland, `YYYY-MM-DD`, today included. The browser matches these
	 * against its own clock for the Today / Tomorrow / Trading now tags, which a weekday alone
	 * can't answer for fortnightly or monthly markets.
	 */
	upcoming: string[];
	tags: string[];
	imageUrl?: string;
}

/** Shown on a card whose market has no photo in the API yet. */
export const fallbackMarketImage = fallbackImage;

/**
 * Distances shown before a visitor shares their location are measured from here. Every listed
 * market is in County Cork, so the city centre is the reference most visitors will recognise.
 */
export const referencePoint: Coordinates & { label: string } = {
	label: 'Cork',
	latitude: 51.8985,
	longitude: -8.4756,
};

export function summarizeMarkets(markets: Market[]) {
	const today = dublinDate();
	const weekEnd = addDays(today, 6);
	const tradingThisWeek = markets.filter((market) =>
		market.upcoming.some((date) => date >= today && date <= weekEnd),
	);

	return [
		{ label: 'Markets listed', value: String(markets.length) },
		{ label: 'Trading in the next 7 days', value: String(tradingThisWeek.length) },
		{ label: 'Days with a market', value: String(new Set(markets.flatMap((market) => market.days)).size) },
	];
}
