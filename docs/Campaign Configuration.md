# Campaign Configuration

## Overview

Each pressure campaign is configured through a JSON file and optional Astro templates. This allows anyone to fork the repository and create their own campaign without writing code.

## Configuration File

Campaign configuration is stored in `src/campaigns/config.json`:

```json
{
  "title": "Campaign Title",
  "description": "Brief description of the campaign (shown on landing page)",
  "slug": "campaign-slug",
  "emailSubject": "Subject line for MP email",
  "emailTemplate": "email-to-mp",
  "userEmailSubject": "Confirm your campaign signature",
  "userEmailTemplate": "magic-link",
  "thankYouMessage": "Thank you for participating!",
  "emailBody": "Optional: Detailed email content sent to MPs.\n\nUse \\n\\n for paragraph breaks.\n\nIf not provided, the description field will be used instead.",
  "cc": ["secretary-of-state@gov.uk"],
  "bcc": ["advocacy@organization.org"],
  "styling": {
    "primaryColor": "#1d70b8",
    "logoUrl": "/logo.svg",
    "bannerUrl": "/banner.jpg"
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
- **description** - Brief explanation of the campaign goal (shown on landing page)
- **emailSubject** - Subject line for emails sent to MPs
- **emailTemplate** - Name of the Astro component for MP email
- **userEmailSubject** - Subject line for magic link emails
- **userEmailTemplate** - Name of the Astro component for magic link email

### Optional Fields

- **slug** - URL-friendly identifier (defaults to slugified title)
- **thankYouMessage** - Custom message shown after confirmation
- **emailBody** - Detailed email content sent to MPs (replaces description in emails)
  - If not provided, `description` will be used in emails
  - Supports `\n\n` for paragraph breaks
  - Single `\n` becomes a line break within paragraphs
  - Automatically formatted for both plain text and HTML emails
- **cc** - Email addresses to CC on all MP emails
- **bcc** - Email addresses to BCC on all MP emails (for tracking)
- **styling** - Custom colors and branding
- **footer** - Organization details for the footer

## Email Body Formatting

The `emailBody` field supports rich, structured content while maintaining simplicity:

### Paragraph Breaks

Use `\n\n` (double newline) to create paragraph breaks:

```json
{
  "emailBody": "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
}
```

This produces:

**Plain Text:**

```
First paragraph.

Second paragraph.

Third paragraph.
```

**HTML:**

```html
<p>First paragraph.</p>

<p>Second paragraph.</p>

<p>Third paragraph.</p>
```

### Line Breaks Within Paragraphs

Use `\n` (single newline) for line breaks within a paragraph:

```json
{
  "emailBody": "I urge you to:\n\n1. Take action A\n2. Take action B\n3. Take action C"
}
```

This produces:

**HTML:**

```html
<p>I urge you to:</p>

<p>1. Take action A<br />2. Take action B<br />3. Take action C</p>
```

### Example: Structured Campaign Email

```json
{
  "emailBody": "I am writing to express deep concern about [issue].\n\nThe situation requires urgent action because:\n\n1. Reason one\n2. Reason two\n3. Reason three\n\nI am urging you to:\n\n1. Support immediate action on X\n2. Press ministers to implement Y\n3. Publicly call for Z\n\nPlease confirm what actions you will take."
}
```

### Separation of Concerns

- **description** - Short summary shown on landing page and meta tags (1-2 sentences)
- **emailBody** - Detailed, structured content for emails to MPs (multiple paragraphs, lists, demands)

This separation allows you to:

- Keep the landing page concise and engaging
- Send comprehensive, well-structured emails to MPs
- Maintain different content for different audiences

## Email Templates

Email templates are generated inline in the Netlify functions. They use campaign data and user details:

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

- **primaryColor** - Primary color for buttons and links
- **logoUrl** - Logo URL for header/footer
- **bannerUrl** (optional) - Full-width banner image displayed in the header with title overlay
  - Place image files in the `public/` directory
  - Reference with path like `/banner.jpg`
  - Image will be displayed full viewport width (edge-to-edge)
  - Minimum height of 400px with `object-fit: cover`
  - Title appears in white with text shadow over a dark gradient overlay for optimal contrast
  - If not provided, header displays normally without banner

### Content

Customize campaign pages and emails:

- Landing page (`src/pages/index.astro`)
- Email templates (inline in `netlify/functions/send-magic-link.ts` and `netlify/functions/verify-and-send.ts`)
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
