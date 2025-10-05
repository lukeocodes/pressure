/**
 * Mock fetch responses for testing
 */

interface MockResponse {
    ok: boolean;
    status: number;
    json: () => Promise<any>;
    text: () => Promise<string>;
    headers: Map<string, string>;
}

/**
 * Create a mock successful fetch response
 */
export function createMockSuccessResponse(data: any, status = 200): MockResponse {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => data,
        text: async () => JSON.stringify(data),
        headers: new Map([['content-type', 'application/json']]),
    } as any;
}

/**
 * Create a mock error fetch response
 */
export function createMockErrorResponse(status = 500, message = 'Internal Server Error'): MockResponse {
    return {
        ok: false,
        status,
        json: async () => ({ error: message }),
        text: async () => message,
        headers: new Map([['content-type', 'application/json']]),
    } as any;
}

/**
 * Mock Parliament API responses
 */
export const mockParliamentAPI = {
    constituency: {
        items: [
            {
                value: {
                    id: 146800,
                    name: 'Holborn and St Pancras',
                    currentRepresentation: {
                        member: {
                            value: {
                                id: 172,
                            },
                        },
                    },
                },
            },
        ],
    },
    member: {
        value: {
            id: 172,
            nameDisplayAs: 'Keir Starmer',
            nameFullTitle: 'Rt Hon Sir Keir Starmer KCB KC MP',
            latestParty: {
                name: 'Labour',
            },
            latestHouseMembership: {
                membershipFrom: 'Holborn and St Pancras',
            },
        },
    },
    contact: {
        value: [
            {
                type: 'Parliamentary',
                email: 'keir.starmer.mp@parliament.uk',
            },
        ],
    },
};

/**
 * Mock Postcodes.io response
 */
export const mockPostcodesAPI = {
    status: 200,
    result: {
        postcode: 'WC1E 6BT',
        parliamentary_constituency: 'Holborn and St Pancras',
        codes: {
            parliamentary_constituency: 'E14000763',
        },
    },
};

