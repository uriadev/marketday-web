declare namespace App {
	interface Locals {
		/**
		 * Set by `src/middleware.ts` on every `/vendor/*` page, before the page renders.
		 * Absent everywhere else.
		 */
		vendorPortal?: import('./lib/auth/session').PortalState;
	}
}
