import type { MailMessage, MailSender } from '../types';

/**
 * Prints instead of sending. The default driver, so a fresh checkout with no `.env` can
 * exercise the whole contact flow without any external service.
 */
export function createLogSender(from: string): MailSender {
	return {
		async send(message: MailMessage): Promise<void> {
			console.info(
				['[mail] (log driver — not sent)', `from:     ${from}`, `to:       ${message.to.join(', ')}`, `reply-to: ${message.replyTo ?? '—'}`, `subject:  ${message.subject}`, '', message.text].join(
					'\n',
				),
			);
		},
	};
}
