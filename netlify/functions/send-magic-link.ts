import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { createEmailService } from '../../src/lib/email/factory';
import type { MagicLinkPayload } from '../../src/lib/types';
import { formatPostcode } from '../../src/lib/api/postcode';
import { validateUserSubmission } from '../../src/lib/validation';

/**
 * Netlify Function: Send magic link email
 * POST /api/send-magic-link
 * Body: { name, email, postcode, mp: { name, email, constituency, party } }
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
        const validation = validateUserSubmission({ name, email, postcode, mp });
        if (!validation.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: validation.error }),
            };
        }

        // Create JWT token for magic link
        const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
        const baseUrl = process.env.BASE_URL || process.env.URL || 'http://localhost:8888';

        // Format postcode for consistent display (e.g., "SW1A1AA" -> "SW1A 1AA")
        const formattedPostcode = formatPostcode(postcode);

        const payload: Omit<MagicLinkPayload, 'iat' | 'exp'> = {
            email,
            name,
            postcode: formattedPostcode,
            mpEmail: mp.email,
            mpName: mp.name,
            constituency: mp.constituency,
            party: mp.party,
        };

        const token = jwt.sign(payload, jwtSecret, {
            expiresIn: '1h',
        });

        const magicLink = `${baseUrl}/verify?token=${token}`;

        // Send email with magic link
        const emailService = createEmailService(event);

        const emailText = `Hi ${name},

Thank you for taking action! Please confirm your participation by clicking the link below:

${magicLink}

This link will expire in 1 hour.

Once confirmed, we'll send an email to your MP (${mp.name}, ${mp.constituency}) on your behalf.

If you didn't request this, you can safely ignore this email.

Best regards,
The Campaign Team`;

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Confirm Your Participation</h2>
  <p>Hi ${name},</p>
  <p>Thank you for taking action! Please confirm your participation by clicking the button below:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${magicLink}" style="background-color: #1d70b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirm and Send Email to MP</a>
  </div>
  <p><small>Or copy and paste this link into your browser:<br>${magicLink}</small></p>
  <p>This link will expire in 1 hour.</p>
  <p>Once confirmed, we'll send an email to your MP (<strong>${mp.name}, ${mp.constituency}</strong>) on your behalf.</p>
  <p><small>If you didn't request this, you can safely ignore this email.</small></p>
  <p>Best regards,<br>The Campaign Team</p>
</body>
</html>`;

        const result = await emailService.sendEmail({
            to: email,
            subject: 'Confirm your campaign signature',
            text: emailText,
            html: emailHtml,
        });

        if (!result.success) {
            console.error('Failed to send email:', result.error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to send confirmation email' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Magic link sent to your email',
            }),
        };
    } catch (error) {
        console.error('Error in send-magic-link function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

