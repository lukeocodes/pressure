# Campaign Configuration

## Overview

Each pressure campaign is configured through a JSON file and optional Astro templates. This allows anyone to fork the repository and create their own campaign without writing code.

## Configuration File

Campaign configuration is stored in `src/campaigns/config.json`:

```json
{
  "title": "Campaign Title",
  "description": "Brief description of the campaign",
  "slug": "campaign-slug",
  "emailSubject": "Subject line for MP email",
  "emailTemplate": "email-to-mp",
  "userEmailSubject": "Confirm your campaign signature",
  "userEmailTemplate": "magic-link",
  "thankYouMessage": "Thank you for participating!",
  "cc": ["secretary-of-state@gov.uk"],
  "bcc": ["advocacy@organization.org"],
  "styling": {
    "primaryColor": "#1d70b8",
    "logoUrl": "/logo.svg"
  },
  "footer": {
    "organizationName": "Your Organization",
    "organizationUrl": "https://yourorg.org"
  }
}
```

## Configuration Fields

### Required Fields

- **title** - Campaign name displayed to users
- **description** - Brief explanation of the campaign goal
- **emailSubject** - Subject line for emails sent to MPs
- **emailTemplate** - Name of the Astro component for MP email
- **userEmailSubject** - Subject line for magic link emails
- **userEmailTemplate** - Name of the Astro component for magic link email

### Optional Fields

- **slug** - URL-friendly identifier (defaults to slugified title)
- **thankYouMessage** - Custom message shown after confirmation
- **cc** - Email addresses to CC on all MP emails
- **bcc** - Email addresses to BCC on all MP emails (for tracking)
- **styling** - Custom colors and branding
- **footer** - Organization details for the footer

## Email Templates

Email templates are Astro components in `src/templates/email/`. They receive campaign data and user details as props:

```astro
---
interface Props {
  campaign: Campaign;
  user: {
    name: string;
    email: string;
    postcode: string;
  };
  mp: {
    name: string;
    constituency: string;
    party: string;
  };
}
---
<p>Dear {mp.name},</p>
<!-- Template content -->
```

## Customization

### Styling

Update the `styling` object in the config to change colors and branding:

- Primary color for buttons and links
- Logo URL for header/footer
- Additional theme variables

### Content

Create custom templates for:

- Landing page (`src/pages/index.astro`)
- Email to MP (`src/templates/email/email-to-mp.astro`)
- Magic link email (`src/templates/email/magic-link.astro`)
- Thank you page (`src/pages/thank-you.astro`)

## Multi-Campaign Support

The platform can host multiple campaigns by:

1. Creating separate configuration files (`config-campaign1.json`, `config-campaign2.json`)
2. Using URL paths to route to different campaigns (`/campaign1`, `/campaign2`)
3. Loading the appropriate configuration based on the route

## Environment Variables

Some sensitive configuration should be set via environment variables:

- `EMAIL_PROVIDER` - Email service provider
- `EMAIL_API_KEY` - API key for email service
- `EMAIL_FROM` - Default sender email address
- `JWT_SECRET` - Secret for magic link token generation
- `BASE_URL` - Base URL for magic links
