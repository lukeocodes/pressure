# Netlify Blobs Email Provider

## Overview

The Netlify Blobs email provider is a queuing-based email solution that stores outbound emails in [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) for asynchronous processing. This allows deployed sites to queue emails instead of sending them immediately, with an external consumer service processing the queue via API.

## Use Cases

- **Serverless Email Sending**: Queue emails on serverless platforms (Netlify) and send via external service with SMTP access
- **Rate Limiting**: Avoid hitting email provider rate limits by controlling send rate
- **Batch Processing**: Process emails in batches during off-peak hours
- **Resilience**: Retry failed emails automatically without losing messages
- **Cost Optimization**: Use self-hosted SMTP servers for sending
- **Testing in Production**: Queue emails in production, review them, then process with real provider
- **Separation of Concerns**: Decouple email generation from email delivery

## Architecture

```
User Request → Netlify Function → Netlify Blobs (Queue)
                                         ↓
                     External Consumer → API Endpoint → Fetch Jobs (removed from queue)
                              ↓
                     SMTP Server → Email Delivery
```

### Components

1. **NetlifyBlobsEmailService** (`src/lib/email/providers/netlify-blobs.ts`)

   - Implements the `EmailService` interface
   - Queues emails as JSON objects in Netlify Blobs
   - Generates unique job IDs for each email
   - Uses `connectLambda()` to properly initialize Netlify Blobs context in Functions

2. **process-email-queue API** (`netlify/functions/process-email-queue.ts`)

   - REST API endpoint for external consumers
   - Fetches jobs and removes them from queue in one operation
   - Optional API key authentication

3. **Email Queue Store**

   - Netlify Blobs store named `email-queue` (configurable)
   - Site-wide store, persists across deploys
   - Each blob is a JSON object representing an email job

4. **External Consumer** (your own service)
   - Polls the API endpoint to fetch pending jobs
   - Jobs are automatically removed from queue when fetched
   - Sends emails via SMTP or other email service

## Configuration

### Environment Variables

#### Queue Provider Configuration

```env
# Use Netlify Blobs as the email provider
EMAIL_PROVIDER=netlify-blobs

# Optional: Custom store name (default: 'email-queue')
EMAIL_NETLIFY_BLOBS_STORE_NAME=my-custom-queue

# Standard email configuration
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=Campaign Name
```

#### Queue API Configuration

```env
# Optional: API key for authentication (recommended for production)
EMAIL_NETLIFY_BLOBS_API_KEY=your_secret_api_key_here

# Optional: Default batch size (default: 10)
EMAIL_NETLIFY_BLOBS_DEFAULT_BATCH_SIZE=10
```

### API Endpoint

The queue API is available at:

```
POST https://your-site.netlify.app/api/process-email-queue
```

Or locally:

```
POST http://localhost:8888/api/process-email-queue
```

## Email Job Structure

Each queued email is stored as a JSON blob with the following structure:

```typescript
{
  id: string;              // Unique job ID (UUID)
  to: string[];            // Recipient email addresses
  cc?: string[];           // CC recipients (optional)
  bcc?: string[];          // BCC recipients (optional)
  subject: string;         // Email subject
  text: string;            // Plain text body
  html?: string;           // HTML body (optional)
  from: string;            // Sender email
  fromName: string;        // Sender name
  createdAt: number;       // Timestamp when queued
}
```

## API Usage

### Fetch Jobs

Retrieve and remove email jobs from the queue:

```bash
curl -X POST https://your-site.netlify.app/api/process-email-queue \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

Response:

```json
{
  "jobs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "to": ["mp@parliament.uk"],
      "subject": "Campaign Message",
      "text": "Email content...",
      "from": "noreply@example.com",
      "fromName": "Campaign Name",
      "createdAt": 1696680000000
    }
  ],
  "returned": 1
}
```

**Note:** Jobs are automatically removed from the queue when fetched. Your consumer is responsible for handling retries if sending fails.

## External Consumer Example

Here's a simple example of an external consumer in Node.js:

```javascript
const API_URL = "https://your-site.netlify.app/api/process-email-queue";
const API_KEY = process.env.EMAIL_QUEUE_API_KEY;
const nodemailer = require("nodemailer");

// Configure your SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function processQueue() {
  try {
    // Fetch jobs (they are removed from queue automatically)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: 10 }),
    });

    const { jobs } = await response.json();

    if (jobs.length === 0) {
      console.log("No jobs in queue");
      return;
    }

    console.log(`Processing ${jobs.length} jobs`);

    for (const job of jobs) {
      try {
        // Send email via SMTP
        await transporter.sendMail({
          from: `"${job.fromName}" <${job.from}>`,
          to: job.to.join(", "),
          cc: job.cc?.join(", "),
          bcc: job.bcc?.join(", "),
          subject: job.subject,
          text: job.text,
          html: job.html,
        });

        console.log(`✓ Sent email ${job.id}`);
      } catch (error) {
        console.error(`✗ Failed to send email ${job.id}:`, error.message);
        // Consider implementing your own retry logic or dead letter queue
      }
    }
  } catch (error) {
    console.error("Failed to process queue:", error);
  }
}

// Run periodically (e.g., every 5 minutes)
setInterval(processQueue, 5 * 60 * 1000);
processQueue(); // Run immediately on start
```

## Usage Workflow

### 1. Queue Emails

Set environment variable to use Netlify Blobs:

```env
EMAIL_PROVIDER=netlify-blobs
```

Your existing code needs the Netlify event passed to the factory:

```typescript
// In a Netlify Function
export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Pass the event to createEmailService for Netlify Blobs context
  const emailService = createEmailService(event);

  await emailService.sendEmail({
    to: "mp@parliament.uk",
    subject: "Campaign Message",
    text: "Email content...",
  });
  // Email is now queued, not sent immediately
};
```

**Important:** When using `netlify-blobs` provider, you must pass the Netlify Lambda event to `createEmailService(event)`. This is required for the `connectLambda()` call that initializes the Netlify Blobs context.

### 2. External Consumer Processes Queue

Your own service (with SMTP access):

1. Polls the API endpoint periodically
2. Fetches jobs (automatically removed from queue)
3. Sends emails via SMTP
4. Handles retries/failures as needed

## Monitoring and Management

### Viewing Queue Contents

Use the Netlify Blobs UI to view queued emails:

1. Go to your Netlify site dashboard
2. Navigate to **Data** → **Blobs**
3. Select the `email-queue` store
4. Browse pending email jobs

### Checking API Logs

View logs for API requests:

1. Go to **Functions** in your Netlify dashboard
2. Click on `process-email-queue`
3. View execution logs to see:
   - API requests and responses
   - Jobs fetched/updated/deleted
   - Error messages

## Error Handling

### Failed Jobs

When the external consumer fetches jobs, they are **immediately removed from the queue**. This means:

- **Success**: Job is sent successfully, no further action needed
- **Failure**: Job is lost from the queue, consumer must handle retries

### Retry Strategies

Implement retry logic in your external consumer:

1. **Immediate Retry**: Retry failed sends immediately (with exponential backoff)
2. **Dead Letter Queue**: Store failed jobs in your own database/queue for manual review
3. **Logging**: Log all failures with full job details for debugging
4. **Alerting**: Set up alerts for high failure rates

Example with retries:

```javascript
async function sendWithRetry(job, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail({
        /* ... */
      });
      return { success: true };
    } catch (error) {
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries) {
        // Save to dead letter queue or log for manual processing
        await saveToDeadLetterQueue(job, error);
        return { success: false, error };
      }
      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
```

## Performance Considerations

### Batch Size

Configure batch size based on:

- **SMTP Rate Limits**: Stay within your SMTP server's rate limits
- **Consumer Processing Speed**: How fast your service can send emails
- **Queue Growth Rate**: Ensure consumer keeps up with incoming emails

Example calculation:

- If you receive 100 emails/hour
- And consumer polls every 10 minutes with batch size 10
- Consumer processes 60 emails/hour → Queue will grow by 40 emails/hour
- Solution: Increase batch size or poll more frequently

### Polling Frequency

Balance between:

- **Faster Delivery**: More frequent polling (e.g., every 1-5 minutes)
- **Resource Efficiency**: Less frequent polling (e.g., every 15-30 minutes)
- **API Request Costs**: Each request counts toward Netlify function execution limits

### Storage Costs

Netlify Blobs is free for most use cases, but consider:

- Each email job is ~2-5 KB
- 1000 emails = 2-5 MB
- Jobs are removed when fetched by consumer
- Queue will grow if consumer is down or polling stops

### Consumer Scalability

Consider scaling your consumer:

- **Multiple Instances**: Run multiple consumer instances for higher throughput
- **Distributed Processing**: Use message queue or job scheduling
- **Error Handling**: Implement exponential backoff for failed sends

## Security Considerations

### API Authentication

- **Strongly recommended**: Set `EMAIL_NETLIFY_BLOBS_API_KEY` in production
- Use a strong, randomly generated key (minimum 32 characters)
- Store the key securely in your consumer service
- Rotate keys periodically

Without an API key, the endpoint is publicly accessible (not recommended).

### Access Control

- Netlify Blobs automatically handles authentication for blob storage
- Only your site's functions can access the blob store
- External consumers access via authenticated API endpoint
- Consider IP whitelisting via Netlify redirects/rewrites

### Sensitive Data

From [Netlify Blobs documentation](https://docs.netlify.com/build/data-and-storage/netlify-blobs/):

> Netlify Blobs is not a storage solution for sensitive data like credit card information or user passwords.

Ensure queued emails don't contain:

- Payment information
- Passwords or API keys
- Personal health information
- Other highly sensitive data

### Data Retention

- All fetched emails are removed from queue immediately
- Consumer is responsible for logging/archiving if needed
- Consider GDPR/privacy requirements for any logs/archives

### SMTP Security

In your external consumer:

- Use TLS/SSL for SMTP connections
- Store SMTP credentials securely (environment variables, secret managers)
- Implement rate limiting to prevent abuse
- Monitor for suspicious activity

## Limitations

From the [Netlify Blobs documentation](https://docs.netlify.com/build/data-and-storage/netlify-blobs/):

- Individual object size cannot exceed 5 GB (ample for emails)
- Object keys cannot exceed 600 bytes
- Store names cannot exceed 64 bytes
- Last write wins (no concurrency control)
- Local development uses sandboxed store (separate from production)

## Troubleshooting

### Emails Not Being Queued

- Check `EMAIL_PROVIDER=netlify-blobs` is set
- Verify function logs for errors
- Confirm `@netlify/blobs` package is installed
- Check Netlify Blobs UI to see if jobs are created
- Ensure you're passing the event to `createEmailService(event)` in Netlify Functions
- If you see `MissingBlobsEnvironmentError`, verify that `connectLambda(event)` is being called

### Emails Not Being Sent

- Verify external consumer is running and polling the API
- Check consumer logs for errors
- Confirm API key is correct (if configured)
- Test API endpoint manually with curl
- Check SMTP credentials and connectivity

### Queue Growing Too Large

- Increase batch size in consumer
- Poll API more frequently
- Check if consumer is running and healthy
- Scale up consumer (multiple instances)

### API Returns 401 Unauthorized

- Verify API key is set correctly in consumer
- Check `EMAIL_NETLIFY_BLOBS_API_KEY` environment variable
- Ensure `Authorization: Bearer TOKEN` header format is correct

### Jobs Lost After Fetch

- Jobs are immediately removed when fetched - this is by design
- Implement retry logic in your consumer before fetching more jobs
- Consider implementing a dead letter queue for failed sends
- Log all fetched jobs before attempting to send

## Related Documentation

- [Email Service Abstraction](./Email Service Abstraction.md)
- [Netlify Blobs Documentation](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
- [Netlify Scheduled Functions](https://docs.netlify.com/functions/scheduled-functions/)

## Future Enhancements

Potential improvements:

- Priority queue support (using metadata)
- Scheduled send times (delay delivery)
- Dead letter queue for permanently failed emails
- Web UI for queue management
- Email preview before sending
- Queue statistics and analytics
