# Local Development

## Overview

This guide covers running the Pressure platform locally for development and testing.

## Quick Start

### Standard Development (Real APIs)

```bash
pnpm dev
```

Runs Astro dev server on `http://localhost:4321` with Netlify Functions.

**Requirements:**

- UK Parliament API (public, no auth needed)
- Email provider configured (or use `console` mode)

### Mock Development (No External APIs)

```bash
pnpm dev:mock
```

Runs both:

- **Mock API Server** on `http://localhost:3001` (cyan logs)
- **Astro Dev Server** on `http://localhost:4321` (magenta logs)

**Benefits:**

- ✅ No internet required
- ✅ No API keys needed
- ✅ Instant responses
- ✅ See email content in console
- ✅ Test magic links easily
- ✅ Predictable test data

## Mock Server

### What It Mocks

1. **MP Lookup** (`/api/find-mp`)

   - Returns mock MP data based on postcode
   - Includes predefined MPs for common postcodes
   - Falls back to generic MP for unknown postcodes

2. **Magic Link Email** (`/api/send-magic-link`)

   - Logs email content to console
   - Returns mock magic link for testing
   - No actual email sent

3. **Email to MP** (`/api/verify-and-send`)
   - Logs MP email content to console
   - Validates mock tokens
   - No actual email sent

### Predefined Mock Data

The mock server includes these MPs:

| Postcode   | MP            | Constituency               | Party        |
| ---------- | ------------- | -------------------------- | ------------ |
| `SW1A 1AA` | Rishi Sunak   | Richmond and Northallerton | Conservative |
| `WC1E 6BT` | Keir Starmer  | Holborn and St Pancras     | Labour       |
| `EC1A 1BB` | Jeremy Corbyn | Islington North            | Independent  |

**Any other postcode** returns a generic test MP.

### Using Mock Server

#### Option 1: Run with `dev:mock` (Recommended)

```bash
pnpm dev:mock
```

This automatically starts both servers with color-coded output.

#### Option 2: Manual Setup

Terminal 1:

```bash
pnpm mock-server
```

Terminal 2:

```bash
MOCK_API_URL=http://localhost:3001 pnpm dev
```

### Mock Server Output

When you interact with the platform, you'll see detailed console output:

```
🔍 Mock: Finding MP for postcode: WC1E6BT
✅ Mock: Found MP: Keir Starmer

📧 Mock Email Content:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Subject: Confirm your campaign signature

Hi John Doe,

Thank you for taking action! Please confirm by clicking:
http://localhost:8888/verify?token=eyJlbWFpbCI6...

Your MP: Keir Starmer, Holborn and St Pancras (Labour)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Testing Magic Links

In mock mode, magic links are logged to the console. Copy and paste them directly into your browser to test the verification flow.

## Environment Variables

### Required for All Modes

```env
JWT_SECRET=dev-secret-change-in-production
BASE_URL=http://localhost:8888
```

### For Real Email (Production-like)

```env
# For SendGrid
EMAIL_PROVIDER=sendgrid
EMAIL_SENDGRID_API_KEY=your_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Campaign Name

# For Mailgun
EMAIL_PROVIDER=mailgun
EMAIL_MAILGUN_API_KEY=your_api_key
EMAIL_MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Campaign Name
```

### For Console Email (Default)

```env
EMAIL_PROVIDER=console
```

Emails are logged to the Netlify Functions console output.

### For Mock APIs

```env
MOCK_API_URL=http://localhost:3001
```

When set, the platform will use the mock server instead of real APIs.

## Development Workflow

### 1. Initial Setup

```bash
# Clone and install
git clone https://github.com/lukeocodes/pressure.git
cd pressure
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env as needed
```

### 2. Start Development

**For quick testing (recommended):**

```bash
pnpm dev:mock
```

**For production-like testing:**

```bash
pnpm dev
```

### 3. Testing the Flow

1. Visit `http://localhost:4321`
2. Fill in the form with:
   - Name: Your test name
   - Email: Any email address
   - Postcode: Use `WC1E 6BT` for Keir Starmer (mock mode)
3. Click "Find My MP and Continue"
4. Check console for mock email
5. Copy magic link from console
6. Paste into browser to verify
7. Check console for MP email output

### 4. Making Changes

The dev server has hot-reload enabled:

- **Astro files** (`.astro`) - Auto-refresh
- **TypeScript files** (`.ts`) - Auto-rebuild
- **Netlify Functions** - Auto-reload
- **Config changes** - Require restart

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With UI
pnpm test:ui

# Coverage
pnpm test:coverage
```

### Test with Different Scenarios

Mock mode makes it easy to test:

**Valid UK MP:**

```
Postcode: WC1E 6BT
Result: Keir Starmer, Holborn and St Pancras
```

**Different Party:**

```
Postcode: SW1A 1AA
Result: Rishi Sunak, Richmond and Northallerton
```

**Generic Fallback:**

```
Postcode: Any other valid format
Result: Generic Test MP
```

**Invalid Postcode:**

```
Postcode: INVALID
Result: Error handling
```

## Debugging

### Enable Verbose Logging

```bash
DEBUG=* pnpm dev:mock
```

### Check Netlify Functions

Visit: `http://localhost:8888/.netlify/functions/[function-name]`

Available functions:

- `find-mp`
- `send-magic-link`
- `verify-and-send`

### Inspect Mock Server

```bash
# Health check
curl http://localhost:3001/health

# Test find-mp
curl -X POST http://localhost:3001/api/find-mp \
  -H "Content-Type: application/json" \
  -d '{"postcode":"WC1E 6BT"}'
```

### View Logs

Mock server logs are color-coded:

- 🔍 Blue - MP lookup
- 📧 Green - Magic link email
- ✉️ Yellow - MP email
- ❌ Red - Errors

## Common Issues

### Port Already in Use

If port 3001 is occupied, kill the process:

```bash
# Find process
lsof -ti:3001

# Kill it
kill -9 $(lsof -ti:3001)
```

Or change the port in `scripts/mock-server.ts`.

### Mock Server Not Running

Check that both processes started:

```bash
pnpm dev:mock
```

You should see:

```
[MOCK] 🎭 Mock API Server Running
[ASTRO] 🚀 astro dev server started
```

### Environment Variables Not Loaded

Make sure `.env` exists:

```bash
cp .env.example .env
```

And restart the dev server.

### Magic Links Not Working

In mock mode:

1. Check console for the full magic link URL
2. Copy the entire URL including the token parameter
3. Paste directly into browser (don't click in terminal)

## Production Build Testing

Test the production build locally:

```bash
# Build
pnpm build

# Preview
pnpm preview
```

Visit `http://localhost:4321` to test the built site.

**Note:** Mock server won't work with the production build. Use real APIs or console email mode.

## Next Steps

- [Campaign Configuration](Campaign%20Configuration.md) - Customize your campaign
- [Testing](Testing.md) - Write and run tests
- [Architecture](Architecture.md) - Understand the system
- [Deployment](../README.md#deployment) - Deploy to Netlify

## Tips

💡 **Use mock mode by default** - Faster and doesn't hit real APIs  
💡 **Test with real APIs occasionally** - Ensure compatibility  
💡 **Check console output** - All mock data is logged  
💡 **Save magic links** - Reuse them during development  
💡 **Run tests frequently** - `pnpm test:watch` in a separate terminal
