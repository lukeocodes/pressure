# Queue API Design

## Overview

The `process-email-queue` endpoint is a simple REST API that allows external consumers to fetch email jobs from Netlify Blobs. When jobs are fetched, they are **immediately removed** from the queue.

## Design Principles

1. **Simplicity**: Single endpoint with one action - fetch jobs
2. **Fire and Forget**: Jobs are removed when fetched; consumer handles retries
3. **Stateless**: No job status tracking, no update/delete endpoints
4. **External Processing**: Consumer is responsible for sending via SMTP and handling failures

## Why This Design?

### Problem Statement

Netlify's serverless platform doesn't allow direct SMTP connections (no access to port 25/587). While Netlify Functions can use third-party email APIs (SendGrid, Mailgun), you may want to:

- Use your own SMTP server (cost savings)
- Send via different email infrastructure
- Maintain full control over email delivery

### Solution

1. **Queue on Netlify**: Store email jobs in Netlify Blobs (serverless-friendly)
2. **Process Externally**: Your own service (with SMTP access) polls the API
3. **Fetch and Remove**: Jobs are atomically removed when fetched
4. **Consumer Handles Retries**: External service manages retry logic

## API Design

### Single Endpoint

```
POST /api/process-email-queue
```

### Request

```json
{
  "limit": 10 // Optional, defaults to EMAIL_NETLIFY_BLOBS_DEFAULT_BATCH_SIZE
}
```

### Response

```json
{
  "jobs": [
    {
      "id": "uuid",
      "to": ["email@example.com"],
      "cc": [],
      "bcc": [],
      "subject": "Subject",
      "text": "Plain text body",
      "html": "<html>...</html>",
      "from": "sender@example.com",
      "fromName": "Sender Name",
      "createdAt": 1234567890
    }
  ],
  "returned": 1
}
```

### Authentication

Optional Bearer token authentication via `EMAIL_NETLIFY_BLOBS_API_KEY`:

```
Authorization: Bearer YOUR_API_KEY
```

## Trade-offs

### ✅ Advantages

1. **Simple Implementation**: No complex state management
2. **No Race Conditions**: Jobs removed immediately, no duplicate processing
3. **Flexible Retry Logic**: Consumer decides retry strategy
4. **Predictable Behavior**: Fetch = Remove, always

### ⚠️ Considerations

1. **No Built-in Retries**: Consumer must implement retry logic
2. **Jobs Can Be Lost**: If consumer crashes after fetch before send
3. **No Status Tracking**: Can't query "failed" jobs in the queue
4. **Consumer Responsibility**: Must implement dead letter queue if needed

## Consumer Responsibilities

The external consumer must:

1. **Poll Regularly**: Check API endpoint at desired interval
2. **Handle Retries**: Implement retry logic with exponential backoff
3. **Dead Letter Queue**: Store permanently failed jobs for manual review
4. **Logging**: Log all fetched jobs and send results
5. **Monitoring**: Alert on high failure rates or queue growth
6. **Idempotency**: Handle potential duplicate sends gracefully

## Example Consumer Pattern

```javascript
async function processQueue() {
  // 1. Fetch jobs (removed from queue)
  const { jobs } = await fetchJobs();

  // 2. Log all jobs immediately (recovery backup)
  await logJobsToBackup(jobs);

  // 3. Process each job with retries
  for (const job of jobs) {
    await sendWithRetry(job, {
      maxRetries: 3,
      onFailure: async (job, error) => {
        // Save to dead letter queue
        await saveToDeadLetterQueue(job, error);
        // Alert on failure
        await notifyFailure(job, error);
      },
    });
  }
}
```

## Alternative Designs Considered

### Option 1: Fetch + Update Pattern

- Fetch jobs (mark as "processing")
- Consumer reports back success/failure
- API updates/deletes based on result

**Why not:** More complex, requires additional endpoints, race conditions with stuck jobs

### Option 2: Peek + Commit Pattern

- Peek jobs (don't remove)
- Consumer processes and commits success
- Jobs timeout and return to queue

**Why not:** Requires timeout management, duplicate processing possible, more state to track

### Option 3: Job Status State Machine

- Pending → Processing → Sent/Failed
- Max retries tracked in queue
- Consumer updates status

**Why not:** Over-engineered for simple use case, state management complexity

## Current Design: Fetch and Remove

Chosen for:

- **Simplicity**: Single responsibility (fetch)
- **Clarity**: Clear ownership (consumer handles everything after fetch)
- **Flexibility**: Consumer can implement any retry/recovery strategy
- **Performance**: No state updates, minimal API calls

## Migration Path

If retry logic is needed in the future, the API can be extended:

```json
// Request
{
  "limit": 10,
  "keepInQueue": true // New optional flag
}
```

But this adds complexity that's not needed for the current use case.

## Conclusion

The fetch-and-remove pattern is the right choice for this use case because:

1. The queue is an **alternative to** direct sending, not a robust job queue
2. Simplicity reduces bugs and maintenance burden
3. Consumer has full control over retry logic and failure handling
4. Clear separation of concerns: Netlify queues, consumer processes

For a production-critical email queue with strict delivery guarantees, consider a dedicated queue service (SQS, Redis Queue, RabbitMQ). For this campaign tool, simple is better.
