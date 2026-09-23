import { graphqlRequest } from './client';

/**
 * A vendor's subscription and bills, for the portal's billing page.
 *
 * `myVendorSubscription` is the Vendors context's (`VendorSubscriptionResolver`). It
 * deliberately carries no price and no link, because the app renders it too and must never
 * point at a way to pay outside the stores. Everything that takes money is the Billing
 * context's (`backend/src/billing/infrastructure/graphql/billing.resolver.ts`), which only
 * this site calls:
 *
 * - `billingOverview`: prices, what the vendor's markets cost, and what the page may offer.
 * - `billingInvoices(first, after)`: the bills, newest first, read from Stripe.
 * - `startSubscriptionCheckout`: a Stripe Checkout URL, for a vendor with no live
 *   subscription. An unused trial of 48 h or more is carried over.
 * - `openBillingPortal`: a Stripe customer portal URL (card, receipts, cancel/resume).
 *
 * **Vendors don't choose their market slots.** They choose markets (the Markets tab,
 * `joinMarket`/`leaveMarket` in `./vendor-team.ts`), and the API bills one slot per market (at least one): Checkout is sized from them, and a
 * live subscription follows every market added or removed, prorated onto the next invoice.
 * Nothing here takes a count.
 *
 * The rules the site relies on:
 * - **Owner-only**, like `myVendorSubscription` (`@Roles(VENDOR)` plus `ownedVendorOf`).
 * - **Amounts are integer cents** in `currency`.
 * - **The API builds every return URL** from its own `WEB_APP_URL`; the site never passes one,
 *   so nothing here can be turned into an open redirect through Stripe.
 *   - Checkout success lands on `/vendor/billing?checkout=success`, and a cancel on
 *     `/vendor/billing?checkout=cancelled`.
 *   - The customer portal returns to `/vendor/billing`.
 * - **Refusals are sentences to show**, such as a second subscription. They arrive as
 *   `GraphQLBusinessError`.
 * - **Billing switched off** (no `STRIPE_*` on the API) answers every Stripe-backed operation
 *   with a 503 sentence, which `portalRead` reports as `unavailable`.
 * - Returned URLs are Stripe-hosted. The site still checks each one against `isStripeUrl`
 *   (`src/lib/security/redirects.ts`) before redirecting to it or linking it.
 */

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'COMPLIMENTARY' | 'INACTIVE';

export interface VendorSubscription {
	status: SubscriptionStatus;
	/** The quantity Stripe last billed. 0 until subscribed. */
	paidMarketSlots: number;
	/** Markets the vendor trades at, chosen on the Markets tab. */
	marketsUsed: number;
	trialEndsAt: string | null;
	compedUntil: string | null;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
	/** False while the API's `BILLING_ENFORCED` kill switch is off: nothing is refused yet. */
	billingEnforced: boolean;
}

export interface BillingPricing {
	/** ISO 4217, upper case. */
	currency: string;
	firstMarketCents: number;
	additionalMarketCents: number;
}

export interface BillingOverview {
	/** A live subscription exists: nothing to subscribe to. */
	hasSubscription: boolean;
	/** A Stripe customer exists: offer the customer portal. */
	canManageBilling: boolean;
	/** One per market the vendor trades at, and at least one. */
	billedMarketSlots: number;
	pricing: BillingPricing;
	/** What `billedMarketSlots` cost a month. */
	monthlyCostCents: number;
	/**
	 * A checkout started now carries the launch discount: half price on the first six monthly
	 * bills, for a vendor who joined during launch and has never subscribed.
	 */
	launchOfferApplies: boolean;
}

export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';

export interface Invoice {
	id: string;
	number: string | null;
	status: InvoiceStatus;
	currency: string;
	totalCents: number;
	amountDueCents: number;
	amountPaidCents: number;
	periodStart: string | null;
	periodEnd: string | null;
	createdAt: string;
	dueDate: string | null;
	hostedInvoiceUrl: string | null;
	invoicePdfUrl: string | null;
}

export interface InvoicePage {
	items: Invoice[];
	nextCursor: string | null;
}

const MY_VENDOR_SUBSCRIPTION = /* GraphQL */ `
	query VendorPortalSubscription {
		myVendorSubscription {
			status
			paidMarketSlots
			marketsUsed
			trialEndsAt
			compedUntil
			currentPeriodEnd
			cancelAtPeriodEnd
			billingEnforced
		}
	}
`;

export async function getSubscription(accessToken: string): Promise<VendorSubscription> {
	return graphqlRequest<VendorSubscription>({
		query: MY_VENDOR_SUBSCRIPTION,
		operation: 'myVendorSubscription',
		accessToken,
	});
}

const BILLING_OVERVIEW = /* GraphQL */ `
	query VendorPortalBillingOverview {
		billingOverview {
			hasSubscription
			canManageBilling
			billedMarketSlots
			pricing {
				currency
				firstMarketCents
				additionalMarketCents
			}
			monthlyCostCents
			launchOfferApplies
		}
	}
`;

export async function getBillingOverview(accessToken: string): Promise<BillingOverview> {
	return graphqlRequest<BillingOverview>({ query: BILLING_OVERVIEW, operation: 'billingOverview', accessToken });
}

export const INVOICES_PER_PAGE = 12;

const BILLING_INVOICES = /* GraphQL */ `
	query VendorPortalInvoices($first: Int!, $after: String) {
		billingInvoices(first: $first, after: $after) {
			items {
				id
				number
				status
				currency
				totalCents
				amountDueCents
				amountPaidCents
				periodStart
				periodEnd
				createdAt
				dueDate
				hostedInvoiceUrl
				invoicePdfUrl
			}
			nextCursor
		}
	}
`;

export async function listInvoices(accessToken: string, after?: string): Promise<InvoicePage> {
	return graphqlRequest<InvoicePage>({
		query: BILLING_INVOICES,
		variables: { first: INVOICES_PER_PAGE, after: after ?? null },
		operation: 'billingInvoices',
		accessToken,
	});
}

const START_CHECKOUT = /* GraphQL */ `
	mutation VendorPortalStartCheckout {
		startSubscriptionCheckout {
			url
		}
	}
`;

export async function startCheckout(accessToken: string): Promise<string> {
	const { url } = await graphqlRequest<{ url: string }>({
		query: START_CHECKOUT,
		operation: 'startSubscriptionCheckout',
		accessToken,
	});
	return url;
}

const OPEN_BILLING_PORTAL = /* GraphQL */ `
	mutation VendorPortalOpenBillingPortal {
		openBillingPortal {
			url
		}
	}
`;

export async function openBillingPortal(accessToken: string): Promise<string> {
	const { url } = await graphqlRequest<{ url: string }>({
		query: OPEN_BILLING_PORTAL,
		operation: 'openBillingPortal',
		accessToken,
	});
	return url;
}
