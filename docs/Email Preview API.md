# Email Preview API

This document describes the email preview API endpoint that generates email previews using the same templates that will be used for actual sending.

## Overview

The email preview API allows the frontend to fetch a real-time preview of the email that will be sent to the MP. This preview is generated using the exact same template functions that are used when actually sending the email, ensuring consistency between what users see and what gets sent.

## Why Use an API for Previews?

### Benefits

1. **Single Source of Truth** - Email templates are defined once in shared modules and used by both preview and sending functions
2. **Consistency** - Users see exactly what will be sent, with no drift between preview and actual email
3. **Maintainability** - Email template changes automatically apply to both preview and sending
4. **Server-Side Processing** - Campaign configuration and formatting logic stay on the server
5. **Type Safety** - TypeScript ensures data structures match between preview and sending

### Architecture

```
Frontend (index.astro)
    ↓
    ├── /api/preview-email → generates preview
    └── /api/send-magic-link → creates JWT token
            ↓
            User clicks magic link
            ↓
        /api/verify-and-send → sends actual email

Both /api/preview-email and /api/verify-and-send use:
    src/lib/email/templates.ts
        ├── generateMPEmailText()
        └── generateMPEmailHtml()
```

## API Endpoint

### POST `/api/preview-email`

Generate an email preview using the same templates as actual sending.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "postcode": "SW1A 1AA",
  "mp": {
    "name": "Jane Smith MP",
    "email": "jane.smith.mp@parliament.uk",
    "constituency": "Test Constituency",
    "party": "Labour"
  }
}
```

**Required Fields:**

- `name` (string) - Constituent's name
- `email` (string) - Constituent's email address
- `postcode` (string) - UK postcode (will be formatted automatically)
- `mp` (object) - MP details
  - `mp.name` (string) - MP's name
  - `mp.constituency` (string) - Constituency name
  - `mp.email` (string, optional) - MP's email address
  - `mp.party` (string, optional) - MP's political party

**Success Response (200):**

```json
{
  "success": true,
  "preview": {
    "to": {
      "name": "Jane Smith MP",
      "email": "jane.smith.mp@parliament.uk"
    },
    "subject": "Urgent: Your constituent's concerns",
    "text": "Dear Jane Smith MP,\n\nI am writing to you as your constituent in Test Constituency (SW1A 1AA)...",
    "html": "<!DOCTYPE html><html>..."
  }
}
```

**Error Responses:**

- `400` - Missing required fields
- `405` - Method not allowed (only POST accepted)
- `500` - Internal server error

## Email Template Module

### Location

`src/lib/email/templates.ts`

### Functions

#### `generateMPEmailText(data: MPEmailData): string`

Generates the plain text version of the email to the MP.

**Parameters:**

```typescript
interface MPEmailData {
  mpName: string; // MP's full name
  constituency: string; // Constituency name
  postcode: string; // Formatted UK postcode
  campaignDescription: string; // Campaign description text
  userName: string; // Constituent's name
  userEmail: string; // Constituent's email
}
```

**Returns:** Plain text email string

#### `generateMPEmailHtml(data: MPEmailData): string`

Generates the HTML version of the email to the MP.

**Parameters:** Same as `generateMPEmailText`

**Returns:** HTML email string with inline styles

#### `generateMPEmailPreview(data: MPEmailData, campaign: Campaign)`

Generates a complete email preview object with subject, text, and HTML.

**Parameters:**

- `data` - MPEmailData object
- `campaign` - Campaign configuration object

**Returns:**

```typescript
{
  subject: string; // Campaign email subject
  text: string; // Plain text version
  html: string; // HTML version
}
```

## Frontend Integration

### Usage in `index.astro`

The frontend calls the preview API when the MP is found:

```typescript
async function fetchEmailPreview(
  name: string,
  email: string,
  postcode: string,
  mp: any
): Promise<string> {
  const response = await fetch("/api/preview-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, postcode, mp }),
  });

  const data = await response.json();
  return data.preview.text;
}
```

### When Preview is Generated

The preview is fetched:

1. After successful postcode validation
2. After MP lookup completes
3. When displaying the email preview section
4. Updates when user changes their name or email (future enhancement)

### Fallback Behavior

If the API call fails, the frontend displays a basic fallback preview using client-side data.

## Template Consistency

### Shared Template Logic

Both preview and sending use the same functions:

```typescript
// In preview-email.ts
const emailPreview = generateMPEmailPreview(data, campaign);

// In verify-and-send.ts
const emailText = generateMPEmailText(data);
const emailHtml = generateMPEmailHtml(data);
```

### What Gets Shared

The following elements are guaranteed to match:

- Email salutation and closing
- Constituent constituency statement with postcode
- Campaign description
- Call to action text
- Platform footer
- HTML styling and layout

### Testing Strategy

Tests verify that:

1. Text and HTML versions contain the same content
2. All required fields appear in both versions
3. Formatting is consistent
4. Template functions produce expected output

See `tests/unit/email-templates.test.ts` for comprehensive template tests.

## Postcode Formatting

Postcodes are automatically formatted before being used in email templates:

```typescript
import { formatPostcode } from "../../src/lib/api/postcode";

const formattedPostcode = formatPostcode(postcode);
// "sw1a1aa" → "SW1A 1AA"
```

This ensures consistent postcode display in:

- Email previews
- Actual emails sent to MPs
- UI displays

## Error Handling

### API Errors

The endpoint handles various error cases:

```typescript
// Missing fields
if (!name || !email || !postcode || !mp) {
    return 400: 'Missing required fields'
}

// Incomplete MP data
if (!mp.name || !mp.constituency) {
    return 400: 'MP object must include name and constituency'
}

// Server errors
catch (error) {
    return 500: 'Internal server error'
}
```

### Frontend Fallback

If the API fails, the frontend shows a basic preview:

```typescript
catch (error) {
  return `Dear ${mp.name},\n\nI am writing to you as your constituent...`;
}
```

## Security Considerations

### Input Validation

- All user inputs are validated on the server
- Postcode format is verified before use
- Campaign configuration is loaded from trusted source
- No user input is directly executed or eval'd

### Data Sanitization

- Email templates use template literals (not eval or Function)
- HTML content should be escaped if displaying user-generated content
- MP data comes from trusted Parliament API

### Rate Limiting

Consider implementing rate limiting on the preview endpoint to prevent abuse:

- Limit requests per IP address
- Require valid session or CSRF token
- Cache preview results for same inputs

## Future Enhancements

1. **Real-time Updates** - Update preview when user changes name/email
2. **Template Customization** - Support campaign-specific email templates
3. **Preview History** - Show user their previous campaign submissions
4. **HTML Preview** - Display HTML version with styles in UI
5. **A/B Testing** - Preview different template variations
6. **Internationalization** - Support multiple languages
7. **Personalization** - Add more personalization options based on constituency data

## Related Documentation

- [Email Templates](./Email%20Templates.md) - Overview of email template system
- [Email Service Abstraction](./Email%20Service%20Abstraction.md) - Email sending infrastructure
- [Dynamic Form Validation](./Dynamic%20Form%20Validation.md) - Form validation including postcode
- [Testing](./Testing.md) - Testing strategy and examples
