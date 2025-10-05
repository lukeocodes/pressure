# Getting Started

Welcome to Pressure! This guide will help you get your pressure campaign up and running.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **pnpm** package manager
- A **Netlify account** (for deployment)
- An **email service** account (SendGrid, Mailgun, or use console mode for dev)

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/lukeocodes/pressure.git
cd pressure
pnpm install
```

### 2. Configure Your Campaign

Edit `src/campaigns/config.json`:

```json
{
  "title": "Your Campaign Name",
  "description": "What this campaign is about",
  "emailSubject": "Subject line for MP emails",
  "cc": [],
  "bcc": []
}
```

### 3. Set Up Environment

Copy the example environment file:

```bash
cp .env.example .env
```

For local development, the defaults work fine. In production, you'll need to configure:

- Email provider credentials
- JWT secret
- Base URL (auto-configured on Netlify)

### 4. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:8888` to see your campaign!

### 5. Test It Out

1. Enter your details (use a real UK postcode)
2. The system will find your MP
3. In console mode, emails are logged instead of sent
4. Check the terminal to see the "sent" emails

## Development Workflow

### File Structure

Most of your customization happens in these files:

```
src/
├── campaigns/
│   └── config.json          # Campaign settings
├── pages/
│   ├── index.astro          # Landing page
│   ├── verify.astro         # Verification page
│   └── thank-you.astro      # Success page
└── layouts/
    └── Layout.astro         # Main layout and styling
```

### Making Changes

1. **Update campaign config** - Edit `src/campaigns/config.json`
2. **Customize styling** - Edit `src/layouts/Layout.astro`
3. **Change page content** - Edit `src/pages/*.astro`
4. **Test your changes** - Run `pnpm test`
5. **Preview build** - Run `pnpm build && pnpm preview`

### Testing

Always test your changes:

```bash
# Run tests
pnpm test

# Run tests in watch mode (recommended during development)
pnpm test:watch

# Check test coverage
pnpm test:coverage
```

## Deploying to Netlify

### Method 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Log in to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist`
6. Add environment variables (see below)
7. Deploy!

### Method 2: Netlify CLI

```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Environment Variables on Netlify

Add these in: Site Settings → Environment Variables

**Required for Production:**

```
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Campaign Name
JWT_SECRET=generate_a_long_random_string_here
```

**Optional:**

```
MAILGUN_DOMAIN=mg.yourdomain.com  # If using Mailgun
```

The `BASE_URL` is automatically set by Netlify.

## Customizing Your Campaign

### Change Colors and Branding

In `src/campaigns/config.json`:

```json
{
  "styling": {
    "primaryColor": "#1d70b8",
    "logoUrl": "/logo.svg"
  }
}
```

Add your logo to `public/logo.svg`.

### Customize Email Content

The emails are generated in the serverless functions. To customize:

1. Edit `netlify/functions/send-magic-link.ts` for the verification email
2. Edit `netlify/functions/verify-and-send.ts` for the MP email

### Add CC/BCC Recipients

In `src/campaigns/config.json`:

```json
{
  "cc": ["advocacy@yourorg.org"],
  "bcc": ["tracking@yourorg.org"]
}
```

Users are automatically CC'd on MP emails.

### Customize Pages

Edit the Astro files in `src/pages/`:

- **`index.astro`** - Landing page with form
- **`verify.astro`** - Verification/loading page
- **`thank-you.astro`** - Success page

## Email Providers

### Console (Development)

Default for local development. Logs emails to console.

```env
EMAIL_PROVIDER=console
```

### SendGrid

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Configure:

```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM=verified@yourdomain.com
```

### Mailgun

1. Sign up at [Mailgun](https://mailgun.com)
2. Verify your domain
3. Configure:

```env
EMAIL_PROVIDER=mailgun
EMAIL_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
```

## Common Issues

### "MP not found for this postcode"

- Ensure you're using a valid UK postcode
- Try a different postcode format (with/without space)
- Check the UK Parliament API is accessible

### Emails not sending

- Check your email provider credentials
- Verify `EMAIL_FROM` is authorized by your provider
- Check Netlify function logs for errors

### Build fails on Netlify

- Ensure all environment variables are set
- Check build logs for specific errors
- Verify `pnpm build` works locally

### Tests failing

- Run `pnpm install` to ensure dependencies are current
- Check for TypeScript errors with `pnpm astro check`
- Review test output for specific failures

## Next Steps

- 📖 Read [Architecture.md](Architecture.md) to understand the system
- 🧪 Read [Testing.md](Testing.md) to learn about testing
- ⚙️ Read [Campaign Configuration.md](Campaign Configuration.md) for advanced config
- 🤝 Read [CONTRIBUTING.md](../CONTRIBUTING.md) to contribute back

## Getting Help

- 📖 Check the [documentation](.)
- 🐛 Report [bugs](https://github.com/lukeocodes/pressure/issues)
- 💬 Start a [discussion](https://github.com/lukeocodes/pressure/discussions)
- 📧 Email: code@lukeoliff.com

## License

This project is licensed under the ISC License - see [LICENSE](../LICENSE) for details.

Happy campaigning! 🙌
