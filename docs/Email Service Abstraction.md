# Email Service Abstraction

## Overview

The email service abstraction layer allows the platform to support multiple email providers without changing application code. This makes it easy to switch providers or support different providers in different environments.

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

Each provider adapter transforms the generic interface into provider-specific API calls. This ensures:

- Consistent error handling
- Uniform logging
- Easy testing and mocking
- Simple provider switching

## Development Mode

In development, the platform uses the console provider by default, which logs emails instead of sending them. This allows testing without API keys or email credits.

## Adding New Providers

To add a new email provider:

1. Create a new adapter in `src/lib/email/providers/`
2. Implement the `EmailService` interface
3. Register the provider in `src/lib/email/factory.ts`
4. Update documentation
