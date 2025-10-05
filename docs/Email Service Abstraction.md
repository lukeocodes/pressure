# Email Service Abstraction

## Overview

The email service abstraction layer supports multiple email providers without changing application code.

## Supported Providers

- **SendGrid** - High-volume transactional email service
- **Mailgun** - Developer-friendly email API
- **AWS SES** - Cost-effective for high volumes
- **SMTP** - Generic SMTP for any provider
- **Console** - Development mode (logs to console)

## Configuration

Email provider is configured via environment variables:

```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Campaign Name
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
