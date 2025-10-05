import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../../netlify/functions/preview-email';
import { createMockEvent } from '../mocks/netlify-event';

// Mock dependencies
vi.mock('../../src/lib/utils', () => ({
    getCampaign: vi.fn(() => ({
        title: 'Test Campaign',
        description: 'This is a test campaign description.',
        emailSubject: 'Urgent: Your constituent\'s concerns',
        cc: [],
        bcc: [],
    })),
}));

vi.mock('../../src/lib/api/postcode', () => ({
    formatPostcode: vi.fn((postcode: string) => {
        const normalized = postcode.toUpperCase().replace(/\s+/g, '');
        if (normalized.length >= 5) {
            return `${normalized.slice(0, -3)} ${normalized.slice(-3)}`;
        }
        return normalized;
    }),
}));

describe('preview-email function', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 405 for non-POST requests', async () => {
        const event = createMockEvent('GET', {});
        const response = await handler(event, {} as any);

        expect(response.statusCode).toBe(405);
        expect(JSON.parse(response.body)).toEqual({ error: 'Method not allowed' });
    });

    it('should return 400 when required fields are missing', async () => {
        const event = createMockEvent('POST', {
            name: 'John Doe',
            // Missing email, postcode, mp
        });
        const response = await handler(event, {} as any);

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        // Should return first validation error (email in this case)
        expect(body.error).toBeDefined();
        expect(body.error).toContain('email');
    });

    it('should return 400 when MP object is incomplete', async () => {
        const event = createMockEvent('POST', {
            name: 'John Doe',
            email: 'john@example.com',
            postcode: 'SW1A 1AA',
            mp: {
                name: 'Test MP',
                // Missing constituency
            },
        });
        const response = await handler(event, {} as any);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({
            error: 'MP object must include name and constituency',
        });
    });

    it('should return email preview successfully', async () => {
        const event = createMockEvent('POST', {
            name: 'John Doe',
            email: 'john@example.com',
            postcode: 'SW1A1AA',
            mp: {
                name: 'Test MP',
                email: 'test.mp@parliament.uk',
                constituency: 'Test Constituency',
            },
        });

        const response = await handler(event, {} as any);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.preview).toBeDefined();
        expect(body.preview.to).toEqual({
            name: 'Test MP',
            email: 'test.mp@parliament.uk',
        });
        expect(body.preview.subject).toBe('Urgent: Your constituent\'s concerns');
        expect(body.preview.text).toContain('Dear Test MP');
        expect(body.preview.text).toContain('SW1A 1AA'); // Formatted postcode
        expect(body.preview.text).toContain('Test Constituency');
        expect(body.preview.text).toContain('John Doe');
        expect(body.preview.text).toContain('This is a test campaign description.');
        expect(body.preview.html).toContain('<p>Dear Test MP,</p>');
    });

    it('should format postcode in preview', async () => {
        const event = createMockEvent('POST', {
            name: 'Jane Smith',
            email: 'jane@example.com',
            postcode: 'ec1a1bb', // Lowercase, no space
            mp: {
                name: 'Another MP',
                email: 'another.mp@parliament.uk',
                constituency: 'Another Constituency',
            },
        });

        const response = await handler(event, {} as any);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.preview.text).toContain('EC1A 1BB'); // Properly formatted
    });

    it('should include campaign description in preview', async () => {
        const event = createMockEvent('POST', {
            name: 'Test User',
            email: 'test@example.com',
            postcode: 'SW1A 1AA',
            mp: {
                name: 'Test MP',
                email: 'test.mp@parliament.uk',
                constituency: 'Test Constituency',
            },
        });

        const response = await handler(event, {} as any);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.preview.text).toContain('This is a test campaign description.');
        expect(body.preview.html).toContain('This is a test campaign description.');
    });

    it('should generate fallback email when MP email is missing', async () => {
        const event = createMockEvent('POST', {
            name: 'Test User',
            email: 'test@example.com',
            postcode: 'SW1A 1AA',
            mp: {
                name: 'Test MP',
                constituency: 'Test Constituency',
                // No email provided
            },
        });

        const response = await handler(event, {} as any);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        // Should generate a fallback email
        expect(body.preview.to.email).toContain('@parliament.uk');
    });
});

