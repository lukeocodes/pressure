import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { createEmailService } from '../../src/lib/email/factory';
import { getCampaign } from '../../src/lib/utils';
import type { MagicLinkPayload } from '../../src/lib/types';
import { generateMPEmailText, generateMPEmailHtml } from '../../src/lib/email/templates';

/**
 * Netlify Function: Verify magic link and send email to MP
 * POST /api/verify-and-send
 * Body: { token: string }
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
        const { token } = JSON.parse(event.body || '{}');

        if (!token) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Token is required' }),
            };
        }

        // Verify JWT token
        const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

        let payload: MagicLinkPayload;
        try {
            payload = jwt.verify(token, jwtSecret) as MagicLinkPayload;
        } catch (error) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid or expired token' }),
            };
        }

        // Load campaign configuration
        const campaign = getCampaign();

        // Prepare email to MP using shared template generator
        const emailService = createEmailService();

        // Use emailBody if provided, otherwise fall back to description
        const campaignContent = campaign.emailBody || campaign.description;

        const emailText = generateMPEmailText({
            mpName: payload.mpName,
            constituency: payload.constituency,
            postcode: payload.postcode,
            campaignDescription: campaignContent,
            userName: payload.name,
            userEmail: payload.email,
        });

        const emailHtml = generateMPEmailHtml({
            mpName: payload.mpName,
            constituency: payload.constituency,
            postcode: payload.postcode,
            campaignDescription: campaignContent,
            userName: payload.name,
            userEmail: payload.email,
        });

        // Build recipient list with CC and BCC
        const ccList = [...campaign.cc, payload.email]; // Always CC the user
        const bccList = campaign.bcc;

        const result = await emailService.sendEmail({
            to: payload.mpEmail,
            cc: ccList.length > 0 ? ccList : undefined,
            bcc: bccList.length > 0 ? bccList : undefined,
            subject: campaign.emailSubject,
            text: emailText,
            html: emailHtml,
        });

        if (!result.success) {
            console.error('Failed to send email to MP:', result.error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to send email to MP' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Email sent to MP successfully',
            }),
        };
    } catch (error) {
        console.error('Error in verify-and-send function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

