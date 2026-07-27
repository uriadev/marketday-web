import type { MailMessage, MailSender } from '../types';

export interface SmtpOptions {
	host: string;
	port: number;
	secure: boolean;
	user?: string;
	pass?: string;
}

/**
 * SMTP sender, used locally to deliver into Mailpit.
 *
 * nodemailer is imported lazily so it is only pulled into the serverless bundle's execution
 * path when this driver is actually selected — production runs the Resend driver and never
 * touches it.
 */
export function createSmtpSender(options: SmtpOptions, from: string): MailSender {
	return {
		async send(message: MailMessage): Promise<void> {
			const { createTransport } = await import('nodemailer');

			const transport = createTransport({
				host: options.host,
				port: options.port,
				secure: options.secure,
				// Mailpit accepts unauthenticated SMTP. Passing an auth block with empty
				// credentials makes nodemailer attempt AUTH and fail, so omit it entirely.
				...(options.user ? { auth: { user: options.user, pass: options.pass ?? '' } } : {}),
			});

			await transport.sendMail({
				from,
				to: message.to,
				replyTo: message.replyTo,
				subject: message.subject,
				html: message.html,
				text: message.text,
			});
		},
	};
}
