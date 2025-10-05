import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { findMPByPostcode } from '../../src/lib/api/parliament';

/**
 * Netlify Function: Find MP by postcode
 * POST /api/find-mp
 * Body: { postcode: string }
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { postcode } = JSON.parse(event.body || '{}');

        if (!postcode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Postcode is required' }),
            };
        }

        const mp = await findMPByPostcode(postcode);

        if (!mp) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'MP not found for this postcode' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mp }),
        };
    } catch (error) {
        console.error('Error in find-mp function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

