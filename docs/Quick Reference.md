# Quick Reference

## Common Commands

### Development

```bash
# Start with mock APIs (recommended)
pnpm dev:mock

# Start with real APIs
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# UI mode
pnpm test:ui

# Coverage report
pnpm test:coverage
```

### Mock Server

```bash
# Run mock server only
pnpm mock-server

# Test mock endpoints
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/find-mp \
  -H "Content-Type: application/json" \
  -d '{"postcode":"WC1E 6BT"}'
```

## Test Postcodes (Mock Mode)

| Postcode    | MP              | Party        |
| ----------- | --------------- | ------------ |
| `SW1A 1AA`  | Rishi Sunak     | Conservative |
| `WC1E 6BT`  | Keir Starmer    | Labour       |
| `EC1A 1BB`  | Jeremy Corbyn   | Independent  |
| _Any other_ | Generic Test MP | Test Party   |

## Environment Variables

### Development (.env)

```env
EMAIL_PROVIDER=console
JWT_SECRET=dev-secret-change-in-production
BASE_URL=http://localhost:8888
MOCK_API_URL=http://localhost:3001  # Optional: use mock APIs
```

### Production (Netlify)

```env
# Direct sending with SendGrid
EMAIL_PROVIDER=sendgrid
EMAIL_SENDGRID_API_KEY=your_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Campaign Name

# Or with Mailgun
EMAIL_PROVIDER=mailgun
EMAIL_MAILGUN_API_KEY=your_key_here
EMAIL_MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Campaign Name

# Queue-based sending with Netlify Blobs
EMAIL_PROVIDER=netlify-blobs
EMAIL_NETLIFY_BLOBS_PROCESSOR_PROVIDER=sendgrid
EMAIL_SENDGRID_API_KEY=your_key_here
EMAIL_NETLIFY_BLOBS_MAX_ATTEMPTS=3
EMAIL_NETLIFY_BLOBS_BATCH_SIZE=10

JWT_SECRET=long-random-secure-string
# BASE_URL auto-detected
```

## File Structure

```
pressure/
├── docs/                      # Documentation
├── netlify/functions/         # Backend serverless functions
├── scripts/                   # Development scripts
│   └── mock-server.ts        # Mock API server
├── src/
│   ├── campaigns/            # Campaign config
│   │   └── config.json
│   ├── components/           # Reusable components
│   ├── layouts/              # Page layouts
│   ├── lib/                  # Utilities
│   │   ├── api/              # API clients
│   │   ├── email/            # Email services
│   │   ├── types.ts          # TypeScript types
│   │   └── utils.ts          # Helper functions
│   └── pages/                # Routes
│       ├── index.astro       # Landing page
│       ├── verify.astro      # Magic link verification
│       └── thank-you.astro   # Success page
└── tests/                    # Test files
```

## URLs

### Development

- **Frontend**: http://localhost:4321
- **Netlify Dev**: http://localhost:8888
- **Mock API**: http://localhost:3001
- **Functions**: http://localhost:8888/.netlify/functions/[name]

### API Endpoints

| Endpoint               | Method | Purpose                 |
| ---------------------- | ------ | ----------------------- |
| `/api/find-mp`         | POST   | Find MP by postcode     |
| `/api/send-magic-link` | POST   | Send verification email |
| `/api/verify-and-send` | POST   | Verify and email MP     |

## Configuration Files

| File                        | Purpose                     |
| --------------------------- | --------------------------- |
| `src/campaigns/config.json` | Campaign settings           |
| `.env`                      | Local environment variables |
| `netlify.toml`              | Netlify configuration       |
| `astro.config.mjs`          | Astro configuration         |
| `vitest.config.ts`          | Test configuration          |

## Documentation

- [Local Development](Local%20Development.md) - Dev setup and workflow
- [Architecture](Architecture.md) - System design
- [Campaign Configuration](Campaign%20Configuration.md) - Campaign setup
- [Email Service Abstraction](Email%20Service%20Abstraction.md) - Email providers
- [Netlify Blobs Email Provider](Netlify%20Blobs%20Email%20Provider.md) - Queue-based email delivery
- [Postcode Validation Service](Postcode%20Validation%20Service.md) - Postcode validation
- [Testing](Testing.md) - Testing guide
- [Data Sources and Licensing](Data%20Sources%20And%20Licensing.md) - API licensing
- [Getting Started](Getting%20Started.md) - Complete setup guide

## Troubleshooting

### Port conflicts

```bash
# Kill process on port 3001
kill -9 $(lsof -ti:3001)

# Kill process on port 4321
kill -9 $(lsof -ti:4321)
```

### Reset dependencies

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Clear build cache

```bash
rm -rf dist .netlify .astro
pnpm build
```

### View logs

```bash
# Mock server shows detailed logs
pnpm dev:mock

# Netlify functions logs
# Check terminal output when functions execute
```

## Quick Links

- [GitHub Repository](https://github.com/lukeocodes/pressure)
- [UK Parliament API](https://members-api.parliament.uk/)
- [Astro Docs](https://docs.astro.build/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

## Support

- 📖 Read the [full documentation](.)
- 🐛 [Report bugs](https://github.com/lukeocodes/pressure/issues)
- 💬 [Start a discussion](https://github.com/lukeocodes/pressure/discussions)
