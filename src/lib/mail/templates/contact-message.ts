import { escapeHtml } from '../../security/text';
import type { ContactRole } from '../../../data/contact';

/**
 * Colours mirror the `@theme` tokens in src/styles/global.css. They are duplicated as literals
 * because email clients get a self-contained document with inline styles — no stylesheet, no
 * CSS custom properties.
 */
const theme = {
	pageBackground: '#f1eee4', // --color-sand
	cardBackground: '#ffffff',
	accent: '#4ca67e', // --color-brand
	ink: '#1f2a25', // --color-ink
	body: '#4d4a42', // --color-body
	muted: '#8a877e', // --color-muted
	border: '#e4e0d5',
	font: "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
} as const;

export interface ContactMessageEmailProps {
	name: string;
	email: string;
	role: ContactRole;
	subject: string;
	message: string;
	submittedAt: Date;
}

export interface RenderedEmail {
	subject: string;
	html: string;
	text: string;
}

const roleLabels: Record<ContactRole, string> = {
	shopper: 'Shopper',
	vendor: 'Vendor',
};

function renderRow(label: string, value: string): string {
	// Both arguments are escaped by the caller's contract; `label` is a literal from this module
	// and `value` is escaped here. Keeping the escape at the interpolation site is the point.
	return `
		<tr>
			<td style="padding:6px 16px 6px 0;font-size:13px;color:${theme.muted};white-space:nowrap;vertical-align:top;">${label}</td>
			<td style="padding:6px 0;font-size:14px;color:${theme.ink};vertical-align:top;">${escapeHtml(value)}</td>
		</tr>`;
}

/**
 * Renders the notification sent to the MarketDay inbox.
 *
 * Every interpolated value is user-controlled and therefore passes through `escapeHtml`.
 * The message body additionally converts newlines to `<br />` *after* escaping, so a
 * submitted "<br />" arrives as visible text rather than as markup.
 */
export function renderContactMessageEmail(props: ContactMessageEmailProps): RenderedEmail {
	const { name, email, role, subject, message, submittedAt } = props;

	const roleLabel = roleLabels[role];
	const timestamp = submittedAt.toISOString();
	const emailSubject = `[MarketDay · ${roleLabel}] ${subject}`;

	const messageHtml = escapeHtml(message).split('\n').join('<br />');

	const html = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${escapeHtml(emailSubject)}</title>
	</head>
	<body style="margin:0;padding:0;background:${theme.pageBackground};font-family:${theme.font};">
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${theme.pageBackground};padding:32px 16px;">
			<tr>
				<td align="center">
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${theme.cardBackground};border-radius:20px;overflow:hidden;">
						<tr>
							<td style="padding:28px 32px 20px;border-bottom:1px solid ${theme.border};">
								<div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${theme.accent};font-weight:700;">New contact enquiry</div>
								<div style="margin-top:6px;font-size:20px;font-weight:700;color:${theme.ink};">${escapeHtml(subject)}</div>
							</td>
						</tr>
						<tr>
							<td style="padding:20px 32px 4px;">
								<table role="presentation" cellpadding="0" cellspacing="0">
									${renderRow('From', name)}
									${renderRow('Email', email)}
									${renderRow('I am a', roleLabel)}
									${renderRow('Submitted', timestamp)}
								</table>
							</td>
						</tr>
						<tr>
							<td style="padding:16px 32px 28px;">
								<div style="padding:18px 20px;background:${theme.pageBackground};border-radius:14px;font-size:15px;line-height:1.6;color:${theme.body};">${messageHtml}</div>
								<div style="margin-top:16px;font-size:13px;color:${theme.muted};">Reply directly to this email to respond to ${escapeHtml(name)}.</div>
							</td>
						</tr>
					</table>
					<div style="max-width:600px;margin-top:16px;font-size:12px;color:${theme.muted};">Sent by the marketday.app contact form.</div>
				</td>
			</tr>
		</table>
	</body>
</html>`;

	const text = [
		'New contact enquiry',
		'',
		`Subject:   ${subject}`,
		`From:      ${name}`,
		`Email:     ${email}`,
		`I am a:    ${roleLabel}`,
		`Submitted: ${timestamp}`,
		'',
		'---',
		'',
		message,
		'',
		'---',
		'Sent by the marketday.app contact form. Reply directly to respond.',
	].join('\n');

	return { subject: emailSubject, html, text };
}
