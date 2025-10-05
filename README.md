# Pressure 📧

An open-source platform for running UK government pressure campaigns. Enables anyone to launch their own campaign to contact Members of Parliament on behalf of concerned citizens.

## Features

- 🏛️ **MP Lookup** - Automatically finds MPs using UK Government APIs
- 📧 **Magic Link Verification** - Secure double opt-in process
- 🔌 **Provider-Agnostic Email** - Swap email providers without code changes
- 🚀 **Netlify Deployment** - Serverless architecture with built-in scalability
- 🎨 **Fully Customizable** - Configure campaigns via JSON and templates
- 🔒 **Secure** - One-time use tokens, rate limiting, input validation
- ♿ **Accessible** - Built following GOV.UK design principles

## How It Works

1. **User fills in details** - Name, email, UK postcode, and address
2. **Service locates MP** - Queries UK Parliament API by postcode
3. **User verifies details** - Confirms MP information and agrees to send
4. **Magic link sent** - Secure token emailed to user
5. **User clicks link** - Validates identity and authorization
6. **Email dispatched** - Message sent to MP (CC'ing user)
7. **Confirmation** - User redirected to thank you page

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Netlify account (for deployment)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/lukeocodes/pressure.git
cd pressure
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (ask the user to configure):

```env
EMAIL_PROVIDER=console
JWT_SECRET=your-secret-key-change-in-production
BASE_URL=http://localhost:8888
```

4. Start the development server:

**With mock APIs (recommended for local dev):**

```bash
pnpm dev:mock
```

**With real APIs:**

```bash
pnpm dev
```

5. Visit `http://localhost:4321`

See [docs/Local Development.md](docs/Local%20Development.md) for detailed development guide.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

See [docs/Testing.md](docs/Testing.md) for detailed testing documentation.

## Configuration

### Campaign Configuration

Edit `src/campaigns/config.json` to customize your campaign:

```json
{
  "title": "Your Campaign Title",
  "description": "Campaign description and call to action",
  "emailSubject": "Subject line for MP emails",
  "cc": ["advocacy@yourorg.org"],
  "bcc": ["tracking@yourorg.org"],
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

### Environment Variables

Configure these in Netlify or your `.env` file:

| Variable          | Description                                               | Required | Default             |
| ----------------- | --------------------------------------------------------- | -------- | ------------------- |
| `EMAIL_PROVIDER`  | Email service provider (`console`, `sendgrid`, `mailgun`) | No       | `console`           |
| `EMAIL_API_KEY`   | API key for email provider                                | Yes\*    | -                   |
| `EMAIL_FROM`      | Sender email address                                      | Yes      | -                   |
| `EMAIL_FROM_NAME` | Sender name                                               | No       | `Pressure Campaign` |
| `JWT_SECRET`      | Secret for magic link tokens                              | Yes      | -                   |
| `BASE_URL`        | Base URL for magic links                                  | Yes\*\*  | -                   |
| `MAILGUN_DOMAIN`  | Mailgun domain (if using Mailgun)                         | Yes\*    | -                   |

\* Required for production email providers  
\*\* Auto-detected on Netlify

### Email Providers

The platform supports multiple email providers. Configure via `EMAIL_PROVIDER`:

- **console** (default) - Logs emails to console (development only)
- **sendgrid** - SendGrid API (requires `EMAIL_API_KEY`)
- **mailgun** - Mailgun API (requires `EMAIL_API_KEY` and `MAILGUN_DOMAIN`)

To add a new provider, see `docs/Email Service Abstraction.md`.

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure environment variables in Netlify dashboard
4. Deploy!

Netlify will automatically:

- Build your Astro site
- Deploy serverless functions
- Set up redirects for API routes
- Provide HTTPS

### Manual Deployment

```bash
npm run build
netlify deploy --prod
```

## Project Structure

```
/
├── docs/                    # Documentation
│   ├── Architecture.md
│   ├── Campaign Configuration.md
│   └── Email Service Abstraction.md
├── netlify/
│   └── functions/           # Serverless backend
│       ├── find-mp.ts
│       ├── send-magic-link.ts
│       └── verify-and-send.ts
├── src/
│   ├── campaigns/
│   │   └── config.json      # Campaign configuration
│   ├── components/          # Reusable components
│   ├── layouts/
│   │   └── Layout.astro     # Base layout
│   ├── lib/
│   │   ├── api/
│   │   │   └── parliament.ts   # UK Parliament API client
│   │   ├── email/
│   │   │   ├── factory.ts      # Email service factory
│   │   │   ├── service.ts      # Email interface
│   │   │   └── providers/      # Email provider adapters
│   │   ├── types.ts            # TypeScript types
│   │   └── utils.ts            # Utility functions
│   └── pages/
│       ├── index.astro         # Landing page
│       ├── verify.astro        # Magic link verification
│       └── thank-you.astro     # Confirmation page
├── netlify.toml             # Netlify configuration
└── astro.config.mjs         # Astro configuration
```

## Customization

### Change Campaign Content

1. Edit `src/campaigns/config.json`
2. Customize page content in `src/pages/*.astro`
3. Update styling in `src/layouts/Layout.astro`

### Customize Email Templates

Edit the email content directly in the Netlify functions:

- Magic link email: `netlify/functions/send-magic-link.ts`
- Email to MP: `netlify/functions/verify-and-send.ts`

### Multi-Campaign Support

To host multiple campaigns:

1. Create separate config files
2. Add routing logic to load appropriate config
3. Deploy with different environment variables per branch

## Security

- Magic links expire after 1 hour
- One-time use tokens (consumed after verification)
- Rate limiting on serverless functions
- Input validation and sanitization
- CORS configuration for API endpoints
- No sensitive data stored (stateless operations)

## Contributing

Contributions are welcome! This is an open-source project designed to empower civic engagement.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`pnpm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## API Reference

### POST `/api/find-mp`

Find MP by postcode.

**Request:**

```json
{
  "postcode": "SW1A 1AA"
}
```

**Response:**

```json
{
  "mp": {
    "name": "John Smith",
    "constituency": "Example Constituency",
    "party": "Example Party",
    "email": "john.smith@parliament.uk"
  }
}
```

### POST `/api/send-magic-link`

Send magic link verification email.

**Request:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "postcode": "SW1A 1AA",
  "address": "123 Example Street",
  "mp": { ... }
}
```

### POST `/api/verify-and-send`

Verify magic link token and send email to MP.

**Request:**

```json
{
  "token": "jwt-token-here"
}
```

## License

This project is licensed under the ISC License - see [LICENSE](LICENSE) file for details.

### Parliamentary Data Attribution

This project uses Parliamentary information from the UK Parliament Members API.

**Contains Parliamentary information licensed under the [Open Parliament Licence v3.0](https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/).**

Important notes:

- This project is **not** endorsed by or affiliated with the UK Parliament
- Parliamentary information is provided "as is" without warranty
- No personal data from Parliamentary sources is stored by this application

See [ATTRIBUTION.md](ATTRIBUTION.md) for full licensing details and compliance information.

## Acknowledgments

- Built with [Astro](https://astro.build)
- Uses [UK Parliament Members API](https://members-api.parliament.uk/) - Parliamentary information licensed under the Open Parliament Licence v3.0
- Uses [Postcodes.io](https://postcodes.io) for constituency lookup (Open Government Licence)
- Inspired by GOV.UK design principles
- **Not endorsed by or affiliated with the UK Parliament**

## Support

- 📖 [Read the docs](docs/)
- 🐛 [Report a bug](https://github.com/lukeocodes/pressure/issues)
- 💡 [Request a feature](https://github.com/lukeocodes/pressure/issues)

---

Made with ❤️ for civic engagement. Power to the people! 🙌
