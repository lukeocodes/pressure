# Email Service Abstraction

## Overview

The email service abstraction layer supports multiple email providers without changing application code.

## Supported Providers

- **SendGrid** - High-volume transactional email service
- **Mailgun** - Developer-friendly email API
- **Netlify Blobs** - Queue-based email delivery for asynchronous processing
- **AWS SES** - Cost-effective for high volumes
- **SMTP** - Generic SMTP for any provider
- **Console** - Development mode (logs to console)

## Configuration

Email provider is configured via environment variables:

```env
# Choose provider: sendgrid, mailgun, netlify-blobs, or console
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Campaign Name

# SendGrid-specific
EMAIL_SENDGRID_API_KEY=your_api_key_here

# Mailgun-specific
EMAIL_MAILGUN_API_KEY=your_api_key_here
EMAIL_MAILGUN_DOMAIN=mg.yourdomain.com

# Netlify Blobs (queue-based delivery)
EMAIL_PROVIDER=netlify-blobs
EMAIL_NETLIFY_BLOBS_STORE_NAME=email-queue  # Optional, default: email-queue
EMAIL_NETLIFY_BLOBS_PROCESSOR_PROVIDER=sendgrid  # Provider for actual sending
EMAIL_SENDGRID_API_KEY=your_api_key_here  # For the processor
```

## Interface

All email providers implement the same interface:

```typescript
interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<EmailResult>;
}

interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  fromName?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

## Provider Implementation

Each provider adapter implements the `EmailService` interface, ensuring consistent error handling and easy provider switching.

## Development Mode

The console provider logs emails instead of sending them, allowing testing without API keys.

## Adding New Providers

To add a new email provider:

1. Create a new adapter in `src/lib/email/providers/`
2. Implement the `EmailService` interface
3. Register the provider in `src/lib/email/factory.ts`
4. Update documentation

## Queue-Based Email Delivery

For detailed information about the Netlify Blobs queue-based email provider, including configuration, monitoring, and troubleshooting, see [Netlify Blobs Email Provider](./Netlify%20Blobs%20Email%20Provider.md).
