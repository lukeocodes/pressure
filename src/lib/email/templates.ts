/**
 * Email template generators for MP emails
 * These templates are shared between preview and actual sending
 */

import type { Campaign } from '../types';

export interface MPEmailData {
  mpName: string;
  constituency: string;
  postcode: string;
  campaignDescription: string;
  userName: string;
  userEmail: string;
}

/**
 * Generate plain text email to MP
 */
export function generateMPEmailText(data: MPEmailData): string {
  return `Dear ${data.mpName},

I am writing to you as your constituent in ${data.constituency} (${data.postcode}).

${data.campaignDescription}

Yours sincerely,
${data.userName}

---
This email was sent via an automated campaign platform.
Constituent details:
Name: ${data.userName}
Email: ${data.userEmail}
Postcode: ${data.postcode}`;
}

/**
 * Generate HTML email to MP
 * Converts line breaks in campaign description to HTML paragraphs
 */
export function generateMPEmailHtml(data: MPEmailData): string {
  // Convert campaign description line breaks to HTML paragraphs
  const campaignHtml = data.campaignDescription
    .split('\n\n')
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => `  <p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n  \n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Dear ${data.mpName},</p>
  
  <p>I am writing to you as your constituent in <strong>${data.constituency}</strong> (${data.postcode}).</p>
  
${campaignHtml}
  
  <p>Yours sincerely,<br><strong>${data.userName}</strong></p>
  
  <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
  <p style="font-size: 12px; color: #666;">
    This email was sent via an automated campaign platform.<br>
    <strong>Constituent details:</strong><br>
    Name: ${data.userName}<br>
    Email: ${data.userEmail}<br>
    Postcode: ${data.postcode}
  </p>
</body>
</html>`;
}

/**
 * Generate complete email preview data
 */
export function generateMPEmailPreview(data: MPEmailData, campaign: Campaign) {
  return {
    subject: campaign.emailSubject,
    text: generateMPEmailText(data),
    html: generateMPEmailHtml(data),
  };
}

