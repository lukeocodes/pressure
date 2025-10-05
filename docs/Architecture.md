# Architecture

## Overview

Pressure is an open-source platform for running UK government pressure campaigns. It allows anyone to launch their own campaign to contact Members of Parliament (MPs) on behalf of concerned citizens.

## Technology Stack

### Frontend

- **Astro** - Static site generator with partial hydration
- **TypeScript** - Type-safe JavaScript
- **Hosting** - Netlify (with serverless functions)

### Backend Services

- **Netlify Functions** - Serverless API endpoints
- **UK Government API** - MP lookup by postcode
- **Email Service** - Generic abstraction layer for email providers

## Architecture Decisions

**Astro** - Optimized for content-heavy sites with minimal JavaScript  
**Serverless Functions** - No infrastructure management, cost-effective scaling  
**Email Abstraction** - Swap providers without code changes

## Data Flow

1. **Address Collection** - User enters UK postcode and address details
2. **MP Lookup** - Serverless function queries UK Parliament API
3. **Verification** - User confirms MP and message details
4. **Magic Link Generation** - Serverless function creates secure token and sends email
5. **Link Validation** - User clicks link, serverless function validates token
6. **Email Dispatch** - Serverless function sends email to MP (CC'ing user)
7. **Confirmation** - User redirected to thank you page

## Security Considerations

- Magic links expire after 1 hour
- One-time use tokens (consumed after verification)
- Rate limiting on serverless functions
- Input validation and sanitization
- CORS configuration for API endpoints
- No sensitive data stored (stateless operations)

## Campaign Configuration

Campaigns are configured via JSON files in `src/campaigns/`. Each campaign includes:

- Campaign metadata (title, description)
- Email template content
- CC and BCC recipients
- Custom styling/assets

## Folder Structure

```
/
├── docs/                    # Documentation
├── netlify/
│   └── functions/           # Serverless backend functions
├── public/                  # Static assets
├── src/
│   ├── campaigns/           # Campaign configurations
│   ├── components/          # Astro components
│   ├── layouts/             # Page layouts
│   ├── lib/                 # Utility functions
│   │   ├── email/           # Email service abstraction
│   │   └── api/             # API clients
│   └── pages/               # Astro pages (routes)
├── LICENSE                  # ISC License
└── README.md               # Project documentation
```
