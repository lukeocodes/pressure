import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NetlifyBlobsEmailService } from '../../src/lib/email/providers/netlify-blobs';

// Mock @netlify/blobs
vi.mock('@netlify/blobs', () => ({
    getStore: vi.fn(),
}));

// Mock uuid
vi.mock('uuid', () => ({
    v4: vi.fn(() => 'test-uuid-123'),
}));

import { getStore } from '@netlify/blobs';

describe('NetlifyBlobsEmailService', () => {
    let mockStore: any;
    let consoleSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock store implementation
        mockStore = {
            setJSON: vi.fn().mockResolvedValue(undefined),
            get: vi.fn(),
            getWithMetadata: vi.fn(),
            list: vi.fn(),
            delete: vi.fn(),
        };

        (getStore as any).mockReturnValue(mockStore);

        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('sendEmail', () => {
        it('should queue email in Netlify Blobs with default store name', async () => {
            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
                html: '<p>Test message</p>',
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('test-uuid-123');
            expect(getStore).toHaveBeenCalledWith('email-queue');
            expect(mockStore.setJSON).toHaveBeenCalledWith(
                'test-uuid-123',
                expect.objectContaining({
                    id: 'test-uuid-123',
                    to: ['recipient@example.com'],
                    subject: 'Test Subject',
                    text: 'Test message',
                    html: '<p>Test message</p>',
                    from: 'test@example.com',
                    fromName: 'Test Sender',
                    status: 'pending',
                    attempts: 0,
                })
            );
        });

        it('should use custom store name when provided', async () => {
            const service = new NetlifyBlobsEmailService(
                'test@example.com',
                'Test Sender',
                'custom-queue'
            );

            await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(getStore).toHaveBeenCalledWith('custom-queue');
        });

        it('should handle multiple recipients', async () => {
            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');

            await service.sendEmail({
                to: ['recipient1@example.com', 'recipient2@example.com'],
                cc: ['cc@example.com'],
                bcc: ['bcc@example.com'],
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(mockStore.setJSON).toHaveBeenCalledWith(
                'test-uuid-123',
                expect.objectContaining({
                    to: ['recipient1@example.com', 'recipient2@example.com'],
                    cc: ['cc@example.com'],
                    bcc: ['bcc@example.com'],
                })
            );
        });

        it('should normalize single recipient to array', async () => {
            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');

            await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(mockStore.setJSON).toHaveBeenCalledWith(
                'test-uuid-123',
                expect.objectContaining({
                    to: ['recipient@example.com'],
                })
            );
        });

        it('should include timestamp in queued email', async () => {
            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');
            const beforeTime = Date.now();

            await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            const afterTime = Date.now();
            const queuedEmail = mockStore.setJSON.mock.calls[0][1];

            expect(queuedEmail.createdAt).toBeGreaterThanOrEqual(beforeTime);
            expect(queuedEmail.createdAt).toBeLessThanOrEqual(afterTime);
        });

        it('should handle custom from and fromName', async () => {
            const service = new NetlifyBlobsEmailService('default@example.com', 'Default Sender');

            await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
                from: 'custom@example.com',
                fromName: 'Custom Sender',
            });

            expect(mockStore.setJSON).toHaveBeenCalledWith(
                'test-uuid-123',
                expect.objectContaining({
                    from: 'custom@example.com',
                    fromName: 'Custom Sender',
                })
            );
        });

        it('should use default from and fromName when not provided', async () => {
            const service = new NetlifyBlobsEmailService('default@example.com', 'Default Sender');

            await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(mockStore.setJSON).toHaveBeenCalledWith(
                'test-uuid-123',
                expect.objectContaining({
                    from: 'default@example.com',
                    fromName: 'Default Sender',
                })
            );
        });

        it('should log queued email details', async () => {
            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');

            await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Email queued in Netlify Blobs: test-uuid-123')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('To: recipient@example.com')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Subject: Test Subject')
            );
        });

        it('should handle Netlify Blobs errors', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockStore.setJSON.mockRejectedValueOnce(new Error('Storage error'));

            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Storage error');
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to queue email in Netlify Blobs:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it('should handle unknown errors', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockStore.setJSON.mockRejectedValueOnce('Unknown error');

            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Unknown error');

            consoleErrorSpy.mockRestore();
        });

        it('should include all required fields in queued email', async () => {
            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');

            await service.sendEmail({
                to: 'recipient@example.com',
                cc: ['cc@example.com'],
                bcc: ['bcc@example.com'],
                subject: 'Test Subject',
                text: 'Test message',
                html: '<p>Test message</p>',
            });

            const queuedEmail = mockStore.setJSON.mock.calls[0][1];

            expect(queuedEmail).toHaveProperty('id');
            expect(queuedEmail).toHaveProperty('to');
            expect(queuedEmail).toHaveProperty('cc');
            expect(queuedEmail).toHaveProperty('bcc');
            expect(queuedEmail).toHaveProperty('subject');
            expect(queuedEmail).toHaveProperty('text');
            expect(queuedEmail).toHaveProperty('html');
            expect(queuedEmail).toHaveProperty('from');
            expect(queuedEmail).toHaveProperty('fromName');
            expect(queuedEmail).toHaveProperty('status');
            expect(queuedEmail).toHaveProperty('createdAt');
            expect(queuedEmail).toHaveProperty('attempts');
            expect(queuedEmail.status).toBe('pending');
            expect(queuedEmail.attempts).toBe(0);
        });

        it('should not include undefined CC/BCC when not provided', async () => {
            const service = new NetlifyBlobsEmailService('test@example.com', 'Test Sender');

            await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            const queuedEmail = mockStore.setJSON.mock.calls[0][1];

            expect(queuedEmail.cc).toBeUndefined();
            expect(queuedEmail.bcc).toBeUndefined();
        });
    });
});

