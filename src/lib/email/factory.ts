import type { EmailService } from './service';
import { ConsoleEmailService } from './providers/console';
import { SendGridEmailService } from './providers/sendgrid';
import { MailgunEmailService } from './providers/mailgun';

/**
 * Email service factory
 * Creates the appropriate email service based on environment configuration
 */
export function createEmailService(): EmailService {
  const provider = process.env.EMAIL_PROVIDER || 'console';
  const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'Pressure Campaign';
  
  switch (provider.toLowerCase()) {
    case 'sendgrid':
      const sendgridKey = process.env.EMAIL_API_KEY;
      if (!sendgridKey) {
        throw new Error('EMAIL_API_KEY is required for SendGrid');
      }
      return new SendGridEmailService(sendgridKey, fromEmail, fromName);
    
    case 'mailgun':
      const mailgunKey = process.env.EMAIL_API_KEY;
      const mailgunDomain = process.env.MAILGUN_DOMAIN;
      if (!mailgunKey || !mailgunDomain) {
        throw new Error('EMAIL_API_KEY and MAILGUN_DOMAIN are required for Mailgun');
      }
      return new MailgunEmailService(mailgunKey, mailgunDomain, fromEmail, fromName);
    
    case 'console':
    default:
      console.log(`Using console email provider (EMAIL_PROVIDER=${provider})`);
      return new ConsoleEmailService(fromEmail, fromName);
  }
}

