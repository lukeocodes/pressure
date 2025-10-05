import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findMPByPostcode } from '../../src/lib/api/parliament';
import { createMockSuccessResponse, createMockErrorResponse, mockParliamentAPI, mockPostcodesAPI } from '../mocks/fetch';

describe('Parliament API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('findMPByPostcode', () => {
        it('should find MP by valid postcode', async () => {
            const mockFetch = vi.fn()
                // First call: postcodes.io
                .mockResolvedValueOnce(createMockSuccessResponse(mockPostcodesAPI))
                // Second call: constituency search
                .mockResolvedValueOnce(createMockSuccessResponse(mockParliamentAPI.constituency))
                // Third call: member details
                .mockResolvedValueOnce(createMockSuccessResponse(mockParliamentAPI.member))
                // Fourth call: contact details
                .mockResolvedValueOnce(createMockSuccessResponse(mockParliamentAPI.contact));

            global.fetch = mockFetch as any;

            const result = await findMPByPostcode('WC1E 6BT');

            expect(result).toEqual({
                name: 'Keir Starmer',
                constituency: 'Holborn and St Pancras',
                party: 'Labour',
                email: 'keir.starmer.mp@parliament.uk',
            });

            expect(mockFetch).toHaveBeenCalledTimes(4);
        });

        it('should normalize postcode before lookup', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce(createMockSuccessResponse(mockPostcodesAPI))
                .mockResolvedValueOnce(createMockSuccessResponse(mockParliamentAPI.constituency))
                .mockResolvedValueOnce(createMockSuccessResponse(mockParliamentAPI.member))
                .mockResolvedValueOnce(createMockSuccessResponse(mockParliamentAPI.contact));

            global.fetch = mockFetch as any;

            await findMPByPostcode('wc1e 6bt'); // lowercase with space

            // Check that the first call normalized the postcode
            expect(mockFetch.mock.calls[0][0]).toContain('WC1E6BT');
        });

        it('should return null for invalid postcode', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce(createMockErrorResponse(404, 'Postcode not found'));

            global.fetch = mockFetch as any;

            const result = await findMPByPostcode('INVALID');

            expect(result).toBeNull();
        });

        it('should return null when constituency not found', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce(createMockSuccessResponse(mockPostcodesAPI))
                .mockResolvedValueOnce(createMockSuccessResponse({ items: [] }));

            global.fetch = mockFetch as any;

            const result = await findMPByPostcode('WC1E 6BT');

            expect(result).toBeNull();
        });

        it('should return null when MP not found', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce(createMockSuccessResponse(mockPostcodesAPI))
                .mockResolvedValueOnce(createMockSuccessResponse({
                    items: [{
                        value: {
                            id: 146800,
                            name: 'Holborn and St Pancras',
                            currentRepresentation: null,
                        },
                    }],
                }));

            global.fetch = mockFetch as any;

            const result = await findMPByPostcode('WC1E 6BT');

            expect(result).toBeNull();
        });

        it('should handle network errors gracefully', async () => {
            const mockFetch = vi.fn()
                .mockRejectedValueOnce(new Error('Network error'));

            global.fetch = mockFetch as any;

            const result = await findMPByPostcode('WC1E 6BT');

            expect(result).toBeNull();
        });

        it('should generate fallback email if contact API fails', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce(createMockSuccessResponse(mockPostcodesAPI))
                .mockResolvedValueOnce(createMockSuccessResponse(mockParliamentAPI.constituency))
                .mockResolvedValueOnce(createMockSuccessResponse(mockParliamentAPI.member))
                .mockResolvedValueOnce(createMockErrorResponse(500));

            global.fetch = mockFetch as any;

            const result = await findMPByPostcode('WC1E 6BT');

            expect(result).toEqual({
                name: 'Keir Starmer',
                constituency: 'Holborn and St Pancras',
                party: 'Labour',
                email: 'keir.starmer@parliament.uk',
            });
        });
    });
});

