import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getCampaign } from '../../src/lib/utils';
import { generateMPEmailPreview } from '../../src/lib/email/templates';
import { formatPostcode } from '../../src/lib/api/postcode';
import { validateName, validateEmail, validatePostcode } from '../../src/lib/validation';

/**
 * Netlify Function: Preview email to MP
 * POST /api/preview-email
 * Body: { name, postcode, mp: { name, constituency } }
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
        const { name, email, postcode, mp } = JSON.parse(event.body || '{}');

        // Validate inputs using centralized validation
        const nameValidation = validateName(name || '');
        if (!nameValidation.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: nameValidation.error }),
            };
        }

        const emailValidation = validateEmail(email || '');
        if (!emailValidation.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: emailValidation.error }),
            };
        }

        const postcodeValidation = validatePostcode(postcode || '');
        if (!postcodeValidation.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: postcodeValidation.error }),
            };
        }

        // Validate MP data
        if (!mp || typeof mp !== 'object') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'MP data is required' }),
            };
        }

        if (!mp.name || !mp.constituency) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'MP object must include name and constituency' }),
            };
        }

        // Load campaign configuration
        const campaign = getCampaign();

        // Format postcode consistently
        const formattedPostcode = formatPostcode(postcode);

        // Use emailBody if provided, otherwise fall back to description
        const campaignContent = campaign.emailBody || campaign.description;

        // Generate email preview using the same function as actual sending
        const emailPreview = generateMPEmailPreview(
            {
                mpName: mp.name,
                constituency: mp.constituency,
                postcode: formattedPostcode,
                campaignDescription: campaignContent,
                userName: name,
                userEmail: email,
            },
            campaign
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                preview: {
                    to: {
                        name: mp.name,
                        email: mp.email || `${mp.name.toLowerCase().replace(/\s+/g, '.')}@parliament.uk`,
                    },
                    subject: emailPreview.subject,
                    text: emailPreview.text,
                    html: emailPreview.html,
                },
            }),
        };
    } catch (error) {
        console.error('Error in preview-email function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

