import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../../netlify/functions/verify-and-send';
import { createMockEvent, createMockContext } from '../mocks/netlify-event';
import * as emailFactory from '../../src/lib/email/factory';
import jwt from 'jsonwebtoken';

describe('verify-and-send function', () => {
    const mockPayload = {
        email: 'john@example.com',
        name: 'John Doe',
        postcode: 'WC1E 6BT',
        address: '123 Test Street',
        mpEmail: 'keir.starmer.mp@parliament.uk',
        mpName: 'Keir Starmer',
        constituency: 'Holborn and St Pancras',
        party: 'Labour',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    it('should return 405 for non-POST requests', async () => {
        const event = createMockEvent({ httpMethod: 'GET' });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(405);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Method not allowed' });
    });

    it('should return 400 when token is missing', async () => {
        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({}),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Token is required' });
    });

    it('should return 401 for invalid token', async () => {
        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ token: 'invalid-token' }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Invalid or expired token' });
    });

    it('should return 401 for expired token', async () => {
        const expiredToken = jwt.sign(mockPayload, 'test-secret', { expiresIn: '-1h' });

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ token: expiredToken }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Invalid or expired token' });
    });

    it('should send email to MP successfully', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: true,
                messageId: 'mp-email-123',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        const token = jwt.sign(mockPayload, 'test-secret', { expiresIn: '1h' });

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ token }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body!);
        expect(body.success).toBe(true);
        expect(body.message).toContain('Email sent to MP successfully');

        expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'keir.starmer.mp@parliament.uk',
                subject: expect.any(String),
            })
        );
    });

    it('should CC the user on the MP email', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: true,
                messageId: 'mp-email-123',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        const token = jwt.sign(mockPayload, 'test-secret', { expiresIn: '1h' });

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ token }),
        });
        const context = createMockContext();

        await handler(event, context);

        const emailCall = mockEmailService.sendEmail.mock.calls[0][0];
        expect(emailCall.cc).toContain('john@example.com');
    });

    it('should include campaign configuration CC and BCC', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: true,
                messageId: 'mp-email-123',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        const token = jwt.sign(mockPayload, 'test-secret', { expiresIn: '1h' });

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ token }),
        });
        const context = createMockContext();

        await handler(event, context);

        const emailCall = mockEmailService.sendEmail.mock.calls[0][0];
        expect(emailCall.cc).toBeDefined();
        expect(Array.isArray(emailCall.cc)).toBe(true);
    });

    it('should return 500 when email sending fails', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: false,
                error: 'Email service error',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        const token = jwt.sign(mockPayload, 'test-secret', { expiresIn: '1h' });

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ token }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Failed to send email to MP' });
    });

    it('should include user details in email content', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: true,
                messageId: 'mp-email-123',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        const token = jwt.sign(mockPayload, 'test-secret', { expiresIn: '1h' });

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ token }),
        });
        const context = createMockContext();

        await handler(event, context);

        const emailCall = mockEmailService.sendEmail.mock.calls[0][0];
        expect(emailCall.text).toContain('John Doe');
        expect(emailCall.text).toContain('123 Test Street');
        expect(emailCall.text).toContain('WC1E 6BT');
        expect(emailCall.text).toContain('Keir Starmer');
        expect(emailCall.html).toContain('John Doe');
    });
});

