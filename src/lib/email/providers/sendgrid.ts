import { BaseEmailService } from '../service';
import type { EmailOptions, EmailResult } from '../../types';

/**
 * SendGrid email provider
 * Requires: EMAIL_API_KEY environment variable
 */
export class SendGridEmailService extends BaseEmailService {
  private apiKey: string;
  
  constructor(apiKey: string, fromEmail: string, fromName: string) {
    super(fromEmail, fromName);
    this.apiKey = apiKey;
  }
  
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const to = this.normalizeRecipients(options.to);
      const cc = options.cc ? this.normalizeRecipients(options.cc) : undefined;
      const bcc = options.bcc ? this.normalizeRecipients(options.bcc) : undefined;
      
      const payload = {
        personalizations: [
          {
            to: to.map((email) => ({ email })),
            ...(cc && { cc: cc.map((email) => ({ email })) }),
            ...(bcc && { bcc: bcc.map((email) => ({ email })) }),
          },
        ],
        from: {
          email: this.getSender(options.from),
          name: this.getSenderName(options.fromName),
        },
        subject: options.subject,
        content: [
          {
            type: 'text/plain',
            value: options.text,
          },
          ...(options.html
            ? [
                {
                  type: 'text/html',
                  value: options.html,
                },
              ]
            : []),
        ],
      };
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('SendGrid error:', error);
        return {
          success: false,
          error: `SendGrid API error: ${response.status}`,
        };
      }
      
      const messageId = response.headers.get('x-message-id') || `sendgrid-${Date.now()}`;
      
      return {
        success: true,
        messageId,
      };
    } catch (error) {
      console.error('SendGrid error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

