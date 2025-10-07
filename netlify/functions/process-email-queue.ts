import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export interface EmailJob {
    id: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    text: string;
    html?: string;
    from: string;
    fromName: string;
    createdAt: number;
}

interface QueueRequest {
    limit?: number;
}

/**
 * Validates the API key from request headers
 */
function validateApiKey(event: HandlerEvent): boolean {
    const apiKey = process.env.EMAIL_NETLIFY_BLOBS_API_KEY;

    if (!apiKey) {
        console.warn('[Email Queue API] No API key configured - allowing all requests');
        return true;
    }

    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    const providedKey = authHeader?.replace(/^Bearer\s+/i, '');

    return providedKey === apiKey;
}

/**
 * API Endpoint: Process Email Queue
 * Provides programmatic access to the Netlify Blobs email queue
 * for external consumers to fetch email jobs
 * 
 * Environment Variables:
 * - EMAIL_NETLIFY_BLOBS_STORE_NAME: Name of the Netlify Blobs store (default: 'email-queue')
 * - EMAIL_NETLIFY_BLOBS_API_KEY: Optional API key for authentication
 * - EMAIL_NETLIFY_BLOBS_DEFAULT_BATCH_SIZE: Default batch size if not specified (default: 10)
 * 
 * API Usage:
 * 
 * Fetch and remove emails from queue:
 * POST /api/process-email-queue
 * Authorization: Bearer YOUR_API_KEY
 * { "limit": 10 }
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Validate API key if configured
    if (!validateApiKey(event)) {
        console.warn('[Email Queue API] Unauthorized request attempt');
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' }),
        };
    }

    const storeName = process.env.EMAIL_NETLIFY_BLOBS_STORE_NAME || 'email-queue';
    const defaultBatchSize = parseInt(process.env.EMAIL_NETLIFY_BLOBS_DEFAULT_BATCH_SIZE || '10', 10);

    try {
        const store = getStore(storeName);
        const request: QueueRequest = JSON.parse(event.body || '{}');

        const limit = request.limit || defaultBatchSize;
        const { blobs } = await store.list();

        console.log(`[Email Queue API] Fetching up to ${limit} jobs from ${blobs.length} total`);

        const jobs: EmailJob[] = [];

        for (const blob of blobs.slice(0, limit)) {
            try {
                const emailJob = await store.get(blob.key, { type: 'json' }) as EmailJob;

                if (!emailJob) {
                    console.warn(`[Email Queue API] Could not retrieve job ${blob.key}`);
                    continue;
                }

                // Delete immediately from queue
                await store.delete(blob.key);

                jobs.push(emailJob);
                console.log(`[Email Queue API] Fetched and removed job ${blob.key}`);
            } catch (error) {
                console.error(`[Email Queue API] Error fetching job ${blob.key}:`, error);
            }
        }

        console.log(`[Email Queue API] Returning ${jobs.length} jobs`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                jobs,
                returned: jobs.length,
            }),
        };
    } catch (error) {
        console.error('[Email Queue API] Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to process request',
                message: error instanceof Error ? error.message : 'Unknown error',
            }),
        };
    }
};

