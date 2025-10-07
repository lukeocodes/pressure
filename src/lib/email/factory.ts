import type { EmailService } from './service';
import { ConsoleEmailService } from './providers/console';
import { SendGridEmailService } from './providers/sendgrid';
import { MailgunEmailService } from './providers/mailgun';
import { NetlifyBlobsEmailService } from './providers/netlify-blobs';

/**
 * Helper function to get environment variable with fallback
 * Supports new naming convention with backward compatibility
 */
function getEnvVar(newName: string, oldName?: string): string | undefined {
  return process.env[newName] || (oldName ? process.env[oldName] : undefined);
}

/**
 * Email service factory
 * Creates the appropriate email service based on environment configuration
 * 
 * Environment Variables:
 * - EMAIL_PROVIDER: Provider to use (sendgrid, mailgun, netlify-blobs, console)
 * - EMAIL_FROM: Default sender email address
 * - EMAIL_FROM_NAME: Default sender name
 * 
 * Provider-specific variables:
 * - EMAIL_SENDGRID_API_KEY: SendGrid API key
 * - EMAIL_MAILGUN_API_KEY: Mailgun API key
 * - EMAIL_MAILGUN_DOMAIN: Mailgun domain
 * - EMAIL_NETLIFY_BLOBS_STORE_NAME: Netlify Blobs store name (default: 'email-queue')
 * - EMAIL_NETLIFY_BLOBS_PROCESSOR_PROVIDER: Provider to use for processing queue
 * - EMAIL_NETLIFY_BLOBS_MAX_ATTEMPTS: Maximum retry attempts (default: 3)
 * - EMAIL_NETLIFY_BLOBS_BATCH_SIZE: Batch size for processing (default: 10)
 */
export function createEmailService(): EmailService {
  const provider = process.env.EMAIL_PROVIDER || 'console';
  const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'Pressure Campaign';
  
  switch (provider.toLowerCase()) {
    case 'sendgrid':
      // New: EMAIL_SENDGRID_API_KEY, fallback to old: EMAIL_API_KEY
      const sendgridKey = getEnvVar('EMAIL_SENDGRID_API_KEY', 'EMAIL_API_KEY');
      if (!sendgridKey) {
        throw new Error('EMAIL_SENDGRID_API_KEY is required for SendGrid');
      }
      return new SendGridEmailService(sendgridKey, fromEmail, fromName);
    
    case 'mailgun':
      // New: EMAIL_MAILGUN_API_KEY, fallback to old: EMAIL_API_KEY
      const mailgunKey = getEnvVar('EMAIL_MAILGUN_API_KEY', 'EMAIL_API_KEY');
      // New: EMAIL_MAILGUN_DOMAIN, fallback to old: MAILGUN_DOMAIN
      const mailgunDomain = getEnvVar('EMAIL_MAILGUN_DOMAIN', 'MAILGUN_DOMAIN');
      if (!mailgunKey || !mailgunDomain) {
        throw new Error('EMAIL_MAILGUN_API_KEY and EMAIL_MAILGUN_DOMAIN are required for Mailgun');
      }
      return new MailgunEmailService(mailgunKey, mailgunDomain, fromEmail, fromName);
    
    case 'netlify-blobs':
      // New: EMAIL_NETLIFY_BLOBS_STORE_NAME, fallback to old: EMAIL_QUEUE_STORE_NAME
      const storeName = getEnvVar('EMAIL_NETLIFY_BLOBS_STORE_NAME', 'EMAIL_QUEUE_STORE_NAME') || 'email-queue';
      console.log(`Using Netlify Blobs email provider (store: ${storeName})`);
      return new NetlifyBlobsEmailService(fromEmail, fromName, storeName);
    
    case 'console':
    default:
      console.log(`Using console email provider (EMAIL_PROVIDER=${provider})`);
      return new ConsoleEmailService(fromEmail, fromName);
  }
}

