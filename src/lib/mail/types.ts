/**
 * Mirrors the driver contract in the MarketDay API (`backend/src/mail/mail-sender.interface.ts`)
 * so the two codebases stay recognisable to each other, and so a message shaped here could be
 * handed to the API's sender later without reshaping.
 */
export interface MailMessage {
	to: string[];
	subject: string;
	html: string;
	text: string;
	/**
	 * A bare address, never a "Display Name <addr>" string. Keeping it bare removes the RFC 2047
	 * encoding and quoting question entirely, which is one less way to smuggle content into a
	 * header. The sender's name goes in the body instead.
	 */
	replyTo?: string;
}

export interface MailSender {
	send(message: MailMessage): Promise<void>;
}

export type MailDriver = 'resend' | 'smtp' | 'log';
