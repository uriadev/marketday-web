import type { MailMessage, MailSender } from '../types';

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Talks to the Resend REST API directly rather than pulling in the `resend` package — the
 * request is one POST, and the API surface here is small enough that the dependency would
 * cost more than it saves. Same approach as the MarketDay API's ResendMailSender.
 */
export function createResendSender(apiKey: string, from: string): MailSender {
	return {
		async send(message: MailMessage): Promise<void> {
			const response = await fetch(RESEND_API_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from,
					to: message.to,
					reply_to: message.replyTo,
					subject: message.subject,
					html: message.html,
					text: message.text,
				}),
			});

			if (!response.ok) {
				// Read the body for the log, but keep it out of the thrown message: the caller
				// surfaces a generic failure to the browser and we don't want provider detail
				// leaking into a user-visible string.
				const detail = await response.text().catch(() => '');
				console.error('[mail] Resend request failed', response.status, detail);
				throw new Error(`Resend request failed (${response.status})`);
			}
		},
	};
}
