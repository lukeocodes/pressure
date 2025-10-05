import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsoleEmailService } from '../../src/lib/email/providers/console';
import { SendGridEmailService } from '../../src/lib/email/providers/sendgrid';
import { MailgunEmailService } from '../../src/lib/email/providers/mailgun';
import { createMockSuccessResponse, createMockErrorResponse } from '../mocks/fetch';

describe('Email Services', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ConsoleEmailService', () => {
        it('should log email to console', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const service = new ConsoleEmailService('test@example.com', 'Test Sender');

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toMatch(/^console-\d+$/);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should handle multiple recipients', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const service = new ConsoleEmailService('test@example.com', 'Test Sender');

            await service.sendEmail({
                to: ['recipient1@example.com', 'recipient2@example.com'],
                cc: ['cc@example.com'],
                bcc: ['bcc@example.com'],
                subject: 'Test Subject',
                text: 'Test message',
            });

            const logOutput = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
            expect(logOutput).toContain('recipient1@example.com');
            expect(logOutput).toContain('recipient2@example.com');
            expect(logOutput).toContain('cc@example.com');
            expect(logOutput).toContain('bcc@example.com');

            consoleSpy.mockRestore();
        });
    });

    describe('SendGridEmailService', () => {
        it('should send email via SendGrid API', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    status: 202,
                    headers: new Map([['x-message-id', 'sendgrid-123']]),
                } as any);

            global.fetch = mockFetch as any;

            const service = new SendGridEmailService('test-api-key', 'test@example.com', 'Test Sender');

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
                html: '<p>Test message</p>',
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('sendgrid-123');
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.sendgrid.com/v3/mail/send',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-api-key',
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('should handle SendGrid API errors', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: false,
                    status: 400,
                    text: async () => 'Bad request',
                } as any);

            global.fetch = mockFetch as any;

            const service = new SendGridEmailService('test-api-key', 'test@example.com', 'Test Sender');

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('SendGrid API error');
        });

        it('should handle CC and BCC recipients', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    status: 202,
                    headers: new Map([['x-message-id', 'sendgrid-123']]),
                } as any);

            global.fetch = mockFetch as any;

            const service = new SendGridEmailService('test-api-key', 'test@example.com', 'Test Sender');

            await service.sendEmail({
                to: 'recipient@example.com',
                cc: ['cc1@example.com', 'cc2@example.com'],
                bcc: ['bcc@example.com'],
                subject: 'Test Subject',
                text: 'Test message',
            });

            const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(payload.personalizations[0].to).toEqual([{ email: 'recipient@example.com' }]);
            expect(payload.personalizations[0].cc).toEqual([
                { email: 'cc1@example.com' },
                { email: 'cc2@example.com' },
            ]);
            expect(payload.personalizations[0].bcc).toEqual([{ email: 'bcc@example.com' }]);
        });
    });

    describe('MailgunEmailService', () => {
        it('should send email via Mailgun API', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce(createMockSuccessResponse({ id: 'mailgun-123' }));

            global.fetch = mockFetch as any;

            const service = new MailgunEmailService('test-api-key', 'example.com', 'test@example.com', 'Test Sender');

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
                html: '<p>Test message</p>',
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('mailgun-123');
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.mailgun.net/v3/example.com/messages',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });

        it('should handle Mailgun API errors', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce(createMockErrorResponse(401, 'Unauthorized'));

            global.fetch = mockFetch as any;

            const service = new MailgunEmailService('test-api-key', 'example.com', 'test@example.com', 'Test Sender');

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                text: 'Test message',
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Mailgun API error');
        });
    });
});

