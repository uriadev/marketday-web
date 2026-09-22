import { graphqlRequest } from './client';

/**
 * A vendor's subscription and bills, for the portal's billing page.
 *
 * `myVendorSubscription` exists on the API (`VendorSubscriptionResolver`). It deliberately
 * carries no price and no link, because the app renders it too and must never point at a way
 * to pay outside the stores. Everything that takes money is the Billing context's, which
 * only this site calls.
 *
 * ## Billing API contract
 *
 * The operations below the subscription read are **proposed**. This site is written against
 * them, and until the API ships them each one throws `ApiOperationUnavailable`, which the
 * billing page renders as "online payments are coming soon". This comment is the canonical
 * copy of the proposal:
 *
 * ```graphql
 * type VendorBillingPlan { currency: String!  firstMarketAmount: Int!  extraMarketAmount: Int!  maxMarketSlots: Int! }
 * type BillingRedirect { url: String! }
 * enum VendorInvoiceStatus { DRAFT OPEN PAID VOID UNCOLLECTIBLE }
 * type VendorInvoice {
 *   id: ID!  number: String  status: VendorInvoiceStatus!  currency: String!
 *   total: Int!  amountDue: Int!  amountPaid: Int!
 *   periodStart: DateTime  periodEnd: DateTime  createdAt: DateTime!  dueDate: DateTime
 *   hostedInvoiceUrl: String  invoicePdf: String
 * }
 * type VendorInvoicePage { items: [VendorInvoice!]!  nextCursor: String }
 *
 * extend type Query {
 *   vendorBillingPlan: VendorBillingPlan!
 *   myVendorInvoices(first: Int = 12, after: String): VendorInvoicePage!
 * }
 * extend type Mutation {
 *   startVendorCheckout(marketSlots: Int!): BillingRedirect!
 *   openVendorBillingPortal: BillingRedirect!
 *   changeVendorMarketSlots(marketSlots: Int!): VendorSubscriptionModel!
 * }
 * ```
 *
 * The rules the site relies on:
 * - **Owner-only**, like `myVendorSubscription` (`@Roles(VENDOR)` plus `assertOwner`).
 * - **Amounts are integer minor units** (cents) in `currency`. The monthly price for `n`
 *   market slots is `firstMarketAmount + (n - 1) * extraMarketAmount`.
 * - **The API builds every return URL** from its own `WEB_APP_URL`; the site never passes one,
 *   so nothing here can be turned into an open redirect through Stripe.
 *   - Checkout success lands on `/vendor/billing?checkout=success`, and a cancel on
 *     `/vendor/billing?checkout=cancelled`.
 *   - The customer portal returns to `/vendor/billing`.
 * - `startVendorCheckout` is for a vendor with no live subscription.
 * - `openVendorBillingPortal` covers the card, billing details and cancel/resume.
 * - `changeVendorMarketSlots` changes the quantity on a live subscription, prorated. It
 *   refuses fewer slots than `marketsUsed` or more than `maxMarketSlots`, with a
 *   `GraphQLBusinessError` the owner can read.
 * - Returned URLs are Stripe-hosted. The site still checks each one against
 *   `isStripeUrl` (`src/lib/security/redirects.ts`) before redirecting to it or linking it.
 */

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'COMPLIMENTARY' | 'INACTIVE';

export interface VendorSubscription {
	status: SubscriptionStatus;
	/** Null means no limit: a trial, complimentary access, or billing not yet enforced. */
	marketSlotLimit: number | null;
	paidMarketSlots: number;
	marketsUsed: number;
	trialEndsAt: string | null;
	compedUntil: string | null;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
	/** False while the API's `BILLING_ENFORCED` kill switch is off: nothing is refused yet. */
	billingEnforced: boolean;
}

export interface BillingPlan {
	currency: string;
	firstMarketAmount: number;
	extraMarketAmount: number;
	maxMarketSlots: number;
}

export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';

export interface Invoice {
	id: string;
	number: string | null;
	status: InvoiceStatus;
	currency: string;
	total: number;
	amountDue: number;
	amountPaid: number;
	periodStart: string | null;
	periodEnd: string | null;
	createdAt: string;
	dueDate: string | null;
	hostedInvoiceUrl: string | null;
	invoicePdf: string | null;
}

export interface InvoicePage {
	items: Invoice[];
	nextCursor: string | null;
}

const MY_VENDOR_SUBSCRIPTION = /* GraphQL */ `
	query VendorPortalSubscription {
		myVendorSubscription {
			status
			marketSlotLimit
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

const VENDOR_BILLING_PLAN = /* GraphQL */ `
	query VendorPortalBillingPlan {
		vendorBillingPlan {
			currency
			firstMarketAmount
			extraMarketAmount
			maxMarketSlots
		}
	}
`;

export async function getPlan(accessToken: string): Promise<BillingPlan> {
	return graphqlRequest<BillingPlan>({ query: VENDOR_BILLING_PLAN, operation: 'vendorBillingPlan', accessToken });
}

export const INVOICES_PER_PAGE = 12;

const MY_VENDOR_INVOICES = /* GraphQL */ `
	query VendorPortalInvoices($first: Int, $after: String) {
		myVendorInvoices(first: $first, after: $after) {
			items {
				id
				number
				status
				currency
				total
				amountDue
				amountPaid
				periodStart
				periodEnd
				createdAt
				dueDate
				hostedInvoiceUrl
				invoicePdf
			}
			nextCursor
		}
	}
`;

export async function listInvoices(accessToken: string, after?: string): Promise<InvoicePage> {
	return graphqlRequest<InvoicePage>({
		query: MY_VENDOR_INVOICES,
		variables: { first: INVOICES_PER_PAGE, after: after ?? null },
		operation: 'myVendorInvoices',
		accessToken,
	});
}

const START_CHECKOUT = /* GraphQL */ `
	mutation VendorPortalStartCheckout($marketSlots: Int!) {
		startVendorCheckout(marketSlots: $marketSlots) {
			url
		}
	}
`;

export async function startCheckout(accessToken: string, marketSlots: number): Promise<string> {
	const { url } = await graphqlRequest<{ url: string }>({
		query: START_CHECKOUT,
		variables: { marketSlots },
		operation: 'startVendorCheckout',
		accessToken,
	});
	return url;
}

const OPEN_BILLING_PORTAL = /* GraphQL */ `
	mutation VendorPortalOpenBillingPortal {
		openVendorBillingPortal {
			url
		}
	}
`;

export async function openBillingPortal(accessToken: string): Promise<string> {
	const { url } = await graphqlRequest<{ url: string }>({
		query: OPEN_BILLING_PORTAL,
		operation: 'openVendorBillingPortal',
		accessToken,
	});
	return url;
}

const CHANGE_MARKET_SLOTS = /* GraphQL */ `
	mutation VendorPortalChangeMarketSlots($marketSlots: Int!) {
		changeVendorMarketSlots(marketSlots: $marketSlots) {
			paidMarketSlots
		}
	}
`;

export async function changeMarketSlots(accessToken: string, marketSlots: number): Promise<void> {
	await graphqlRequest({
		query: CHANGE_MARKET_SLOTS,
		variables: { marketSlots },
		operation: 'changeVendorMarketSlots',
		accessToken,
	});
}
