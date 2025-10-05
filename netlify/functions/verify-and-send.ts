import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { createEmailService } from '../../src/lib/email/factory';
import { getCampaign } from '../../src/lib/utils';
import type { MagicLinkPayload } from '../../src/lib/types';

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

        // Prepare email to MP
        const emailService = createEmailService();

        const emailText = `Dear ${payload.mpName},

I am writing to you as your constituent from ${payload.address}, ${payload.postcode}.

${campaign.description}

I urge you to take action on this important matter.

Yours sincerely,
${payload.name}

---
This email was sent via an automated campaign platform.
Constituent details: ${payload.email}`;

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Dear ${payload.mpName},</p>
  
  <p>I am writing to you as your constituent from <strong>${payload.address}, ${payload.postcode}</strong>.</p>
  
  <p>${campaign.description}</p>
  
  <p>I urge you to take action on this important matter.</p>
  
  <p>Yours sincerely,<br><strong>${payload.name}</strong></p>
  
  <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
  <p style="font-size: 12px; color: #666;">
    This email was sent via an automated campaign platform.<br>
    Constituent details: ${payload.email}
  </p>
</body>
</html>`;

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

