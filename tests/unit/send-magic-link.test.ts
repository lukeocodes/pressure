import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../../netlify/functions/send-magic-link';
import { createMockEvent, createMockContext } from '../mocks/netlify-event';
import * as emailFactory from '../../src/lib/email/factory';
import jwt from 'jsonwebtoken';

describe('send-magic-link function', () => {
    const mockMP = {
        name: 'Keir Starmer',
        email: 'keir.starmer.mp@parliament.uk',
        constituency: 'Holborn and St Pancras',
        party: 'Labour',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        process.env.BASE_URL = 'http://localhost:8888';
    });

    it('should return 405 for non-POST requests', async () => {
        const event = createMockEvent({ httpMethod: 'GET' });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(405);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Method not allowed' });
    });

    it('should return 400 when required fields are missing', async () => {
        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ name: 'John Doe' }), // Missing other fields
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body!);
        // Should return validation error for first missing/invalid field
        expect(body.error).toBeDefined();
    });

    it('should send magic link email successfully', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: true,
                messageId: 'test-123',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                postcode: 'WC1E 6BT',
                mp: mockMP,
            }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body!);
        expect(body.success).toBe(true);
        expect(body.message).toContain('Magic link sent');
        expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'john@example.com',
                subject: 'Confirm your campaign signature',
            })
        );
    });

    it('should include magic link with JWT token in email', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: true,
                messageId: 'test-123',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                postcode: 'WC1E 6BT',
                mp: mockMP,
            }),
        });
        const context = createMockContext();

        await handler(event, context);

        const emailCall = mockEmailService.sendEmail.mock.calls[0][0];
        expect(emailCall.text).toContain('http://localhost:8888/verify?token=');
        expect(emailCall.html).toContain('http://localhost:8888/verify?token=');
    });

    it('should return 500 when email sending fails', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: false,
                error: 'Email service error',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                postcode: 'WC1E 6BT',
                mp: mockMP,
            }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Failed to send confirmation email' });
    });

    it('should handle internal errors gracefully', async () => {
        vi.spyOn(emailFactory, 'createEmailService').mockImplementation(() => {
            throw new Error('Service initialization failed');
        });

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                postcode: 'WC1E 6BT',
                mp: mockMP,
            }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Internal server error' });
    });

    it('should format postcodes consistently in JWT payload', async () => {
        const mockEmailService = {
            sendEmail: vi.fn().mockResolvedValue({
                success: true,
                messageId: 'test-123',
            }),
        };

        vi.spyOn(emailFactory, 'createEmailService').mockReturnValue(mockEmailService as any);

        // Test with unformatted postcode
        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                postcode: 'SW1A1AA', // No space
                mp: mockMP,
            }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(200);

        // Extract and verify the JWT token contains formatted postcode
        const emailCall = mockEmailService.sendEmail.mock.calls[0][0];
        const magicLinkMatch = emailCall.text.match(/http:\/\/localhost:8888\/verify\?token=([^\s]+)/);
        expect(magicLinkMatch).toBeTruthy();

        if (magicLinkMatch) {
            const token = magicLinkMatch[1];
            const decoded = jwt.verify(token, 'test-secret') as any;
            // Postcode should be formatted with space
            expect(decoded.postcode).toBe('SW1A 1AA');
        }
    });
});

