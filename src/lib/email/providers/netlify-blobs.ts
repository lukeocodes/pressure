import { getStore, connectLambda } from '@netlify/blobs';
import { BaseEmailService } from '../service';
import type { EmailOptions, EmailResult } from '../../types';
import { v4 as uuid } from 'uuid';

/**
 * Netlify Blobs email provider
 * Queues emails in Netlify Blobs for asynchronous processing
 * Useful for deployed sites that want to queue emails for batch sending
 */
export class NetlifyBlobsEmailService extends BaseEmailService {
    private storeName: string;
    private lambdaEvent?: any;

    constructor(fromEmail: string, fromName: string, storeName: string = 'email-queue', lambdaEvent?: any) {
        super(fromEmail, fromName);
        this.storeName = storeName;
        this.lambdaEvent = lambdaEvent;
    }

    async sendEmail(options: EmailOptions): Promise<EmailResult> {
        try {
            // Connect Lambda context if running in Netlify Functions
            if (this.lambdaEvent) {
                connectLambda(this.lambdaEvent);
            }

            const store = getStore(this.storeName);

            // Generate unique ID for this email job
            const jobId = uuid();

            // Normalize recipients
            const to = this.normalizeRecipients(options.to);
            const cc = options.cc ? this.normalizeRecipients(options.cc) : undefined;
            const bcc = options.bcc ? this.normalizeRecipients(options.bcc) : undefined;

            // Create email job object
            const emailJob = {
                id: jobId,
                to,
                cc,
                bcc,
                subject: options.subject,
                text: options.text,
                html: options.html,
                from: this.getSender(options.from),
                fromName: this.getSenderName(options.fromName),
                createdAt: Date.now(),
            };

            // Store in Netlify Blobs
            await store.setJSON(jobId, emailJob);

            console.log(`Email queued in Netlify Blobs: ${jobId}`);
            console.log(`To: ${to.join(', ')}`);
            console.log(`Subject: ${options.subject}`);

            return {
                success: true,
                messageId: jobId,
            };
        } catch (error) {
            console.error('Failed to queue email in Netlify Blobs:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}

