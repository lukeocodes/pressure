# Email Templates

This document describes the email templates used in the Pressure campaign platform.

## Overview

The platform sends two types of emails:

1. **Magic Link Email** - Sent to the user to verify their email address and confirm participation
2. **Email to MP** - Sent to the Member of Parliament on behalf of the constituent

## Email Template Implementation

Email templates are generated inline in the Netlify functions, providing simplicity, type safety, and performance without requiring a separate template engine.

### Available Data

The following data is available for email generation:

#### User Information

- `payload.name` - The constituent's name
- `payload.email` - The constituent's email
- `payload.postcode` - The constituent's postcode (automatically formatted with standard spacing, e.g., "SW1A 1AA")

#### MP Information

- `payload.mpName` - The Member of Parliament's name
- `payload.mpEmail` - The MP's email address
- `payload.constituency` - The constituency name
- `payload.party` - The MP's political party

#### Campaign Information

- `campaign.title` - Campaign title
- `campaign.description` - Campaign description
- `campaign.emailSubject` - Subject line for MP emails

### Example Email Structure

```
Dear [MP Name],

I am writing to you as your constituent in [Constituency] ([Postcode]).

[Campaign Description / Email Body]

Yours sincerely,
[Constituent Name]

---
This email was sent via an automated campaign platform.
Constituent details:
Name: [Constituent Name]
Email: [Constituent Email]
Postcode: [Postcode]
```

### Key Features

1. **Constituent Verification** - The constituent's postcode format is validated client-side
2. **Postcode Formatting** - Postcodes are automatically formatted with standard UK spacing (e.g., "SW1A1AA" becomes "SW1A 1AA") before being stored in the JWT payload and used in emails
3. **MP Matching** - The MP is automatically matched using the Parliament API
4. **Double Opt-in** - Users must click a magic link to confirm before the email is sent
5. **CC to User** - The constituent is automatically CC'd on the email to their MP
6. **Campaign Context** - The email includes campaign-specific messaging

## Customizing Templates

To customize the email content:

1. Edit the `verify-and-send.ts` function in `netlify/functions/`
2. Modify the `emailText` and `emailHtml` variables
3. Use the payload data to personalize the message:
   - `payload.name` - Constituent's name
   - `payload.postcode` - Constituent's postcode
   - `payload.constituency` - Constituency name
   - `payload.mpName` - MP's name
   - `payload.mpEmail` - MP's email address
   - `payload.party` - MP's political party

## Future Enhancements

Potential improvements to the email template system:

1. **Template Engine Integration** - Use a proper template engine (e.g., Handlebars, Nunjucks) to render templates from files
2. **Campaign-Specific Templates** - Allow each campaign to have custom email templates
3. **Rich Content** - Support for images, formatted lists, and more complex layouts
4. **A/B Testing** - Test different email variations for effectiveness
5. **Personalization** - Add more personalization options based on constituency data

## Email Service Configuration

Emails are sent through the Email Service Abstraction layer. See [Email Service Abstraction.md](./Email%20Service%20Abstraction.md) for details on configuring email providers.

## Testing

When testing locally, the console provider can be used to output emails to the console instead of sending them. See [Local Development.md](./Local%20Development.md) for configuration details.
