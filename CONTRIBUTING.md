# Contributing to Pressure

Thank you for your interest in contributing to Pressure! This project aims to empower civic engagement through technology, and we welcome contributions from everyone.

## Code of Conduct

Be respectful, inclusive, and considerate in all interactions. We're building tools for democracy - let's model good behavior.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/lukeocodes/pressure/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing [Issues](https://github.com/lukeocodes/pressure/issues) and [Discussions](https://github.com/lukeocodes/pressure/discussions)
2. Create a new issue with:
   - Clear use case
   - Expected behavior
   - Why this benefits the community
   - Any implementation ideas

### Contributing Code

1. **Fork the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/pressure.git
   cd pressure
   ```

2. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

   Use prefixes: `feature/`, `fix/`, `docs/`, `refactor/`

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Make your changes**

   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Test your changes locally

5. **Commit your changes**
   Use [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat: add new email provider"
   git commit -m "fix: resolve postcode validation issue"
   git commit -m "docs: update configuration guide"
   ```

6. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a PR on GitHub with:
   - Clear title and description
   - Link to related issues
   - Screenshots/videos if UI changes
   - Test results

## Development Guidelines

### Project Structure

- `docs/` - Documentation
- `netlify/functions/` - Serverless backend
- `src/lib/` - Shared utilities and services
- `src/pages/` - Frontend pages
- `src/campaigns/` - Campaign configurations

### Code Style

- Use TypeScript for type safety
- Prefer functional programming patterns
- Keep functions small and focused
- Add JSDoc comments for public APIs
- Use meaningful variable names

### Testing

Before submitting:

1. Test locally with `npm run dev`
2. Test the build with `npm run build && npm run preview`
3. Test with different email providers
4. Verify mobile responsiveness
5. Check accessibility

### Documentation

Update documentation when:

- Adding new features
- Changing configuration options
- Adding email providers
- Modifying API endpoints

Documentation files in `docs/` should use sentence case for filenames.

## Adding Email Providers

To add a new email provider:

1. Create a new adapter in `src/lib/email/providers/your-provider.ts`
2. Implement the `EmailService` interface
3. Add factory logic in `src/lib/email/factory.ts`
4. Update `docs/Email Service Abstraction.md`
5. Add environment variables to `.env.example`
6. Update README with provider documentation

Example:

```typescript
import { BaseEmailService } from "../service";
import type { EmailOptions, EmailResult } from "../../types";

export class YourProviderEmailService extends BaseEmailService {
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    // Implementation
  }
}
```

## Questions?

- Open a [Discussion](https://github.com/lukeocodes/pressure/discussions)
- Join our community chat (if available)
- Email: code@lukeoliff.com

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

Thank you for making democracy more accessible! 🙌
