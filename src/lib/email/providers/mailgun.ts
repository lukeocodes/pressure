import { BaseEmailService } from '../service';
import type { EmailOptions, EmailResult } from '../../types';

/**
 * Mailgun email provider
 * Requires: EMAIL_MAILGUN_API_KEY and EMAIL_MAILGUN_DOMAIN environment variables
 */
export class MailgunEmailService extends BaseEmailService {
  private apiKey: string;
  private domain: string;

  constructor(apiKey: string, domain: string, fromEmail: string, fromName: string) {
    super(fromEmail, fromName);
    this.apiKey = apiKey;
    this.domain = domain;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const to = this.normalizeRecipients(options.to);
      const cc = options.cc ? this.normalizeRecipients(options.cc) : [];
      const bcc = options.bcc ? this.normalizeRecipients(options.bcc) : [];

      const formData = new URLSearchParams();
      formData.append('from', `${this.getSenderName(options.fromName)} <${this.getSender(options.from)}>`);
      to.forEach((email) => formData.append('to', email));
      cc.forEach((email) => formData.append('cc', email));
      bcc.forEach((email) => formData.append('bcc', email));
      formData.append('subject', options.subject);
      formData.append('text', options.text);
      if (options.html) {
        formData.append('html', options.html);
      }

      const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Mailgun error:', error);
        return {
          success: false,
          error: `Mailgun API error: ${response.status}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      console.error('Mailgun error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

