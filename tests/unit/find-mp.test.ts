import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../../netlify/functions/find-mp';
import { createMockEvent, createMockContext } from '../mocks/netlify-event';
import { createMockSuccessResponse, mockParliamentAPI, mockPostcodesAPI } from '../mocks/fetch';
import * as parliament from '../../src/lib/api/parliament';

describe('find-mp function', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 405 for non-POST requests', async () => {
        const event = createMockEvent({ httpMethod: 'GET' });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(405);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Method not allowed' });
    });

    it('should return 400 when postcode is missing', async () => {
        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({}),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Postcode is required' });
    });

    it('should return MP details for valid postcode', async () => {
        const mockMP = {
            name: 'Keir Starmer',
            constituency: 'Holborn and St Pancras',
            party: 'Labour',
            email: 'keir.starmer.mp@parliament.uk',
        };

        vi.spyOn(parliament, 'findMPByPostcode').mockResolvedValueOnce(mockMP);

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ postcode: 'WC1E 6BT' }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body!)).toEqual({ mp: mockMP });
    });

    it('should return 404 when MP not found', async () => {
        vi.spyOn(parliament, 'findMPByPostcode').mockResolvedValueOnce(null);

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ postcode: 'INVALID' }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body!)).toEqual({ error: 'MP not found for this postcode' });
    });

    it('should return 500 on internal errors', async () => {
        vi.spyOn(parliament, 'findMPByPostcode').mockRejectedValueOnce(new Error('API error'));

        const event = createMockEvent({
            httpMethod: 'POST',
            body: JSON.stringify({ postcode: 'WC1E 6BT' }),
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body!)).toEqual({ error: 'Internal server error' });
    });

    it('should handle malformed JSON body', async () => {
        const event = createMockEvent({
            httpMethod: 'POST',
            body: 'not valid json',
        });
        const context = createMockContext();

        const response = await handler(event, context);

        expect(response.statusCode).toBe(500);
    });
});

