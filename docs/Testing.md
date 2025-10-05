# Testing

## Overview

The Pressure platform uses [Vitest](https://vitest.dev/) as its testing framework. Vitest is fast, modern, and provides excellent TypeScript support with a Jest-compatible API.

## Running Tests

### Run all tests

```bash
pnpm test
```

### Run tests in watch mode

```bash
pnpm test:watch
```

### Run tests with UI

```bash
pnpm test:ui
```

### Generate coverage report

```bash
pnpm test:coverage
```

## Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── parliament.test.ts   # UK Parliament API tests
│   ├── email-service.test.ts # Email service provider tests
│   ├── utils.test.ts        # Utility function tests
│   ├── find-mp.test.ts      # find-mp function tests
│   ├── send-magic-link.test.ts # magic link function tests
│   └── verify-and-send.test.ts # verification function tests
├── integration/             # Integration tests (future)
└── mocks/                   # Test mocks and utilities
    ├── netlify-event.ts     # Netlify function event mocks
    └── fetch.ts             # Fetch API mocks
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Feature Name", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it("should do something", () => {
    // Arrange
    const input = "test";

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe("expected output");
  });
});
```

### Mocking External APIs

```typescript
import { vi } from "vitest";
import { createMockSuccessResponse } from "../mocks/fetch";

it("should handle API response", async () => {
  const mockFetch = vi
    .fn()
    .mockResolvedValueOnce(createMockSuccessResponse({ data: "test" }));

  global.fetch = mockFetch as any;

  const result = await apiCall();

  expect(result).toEqual({ data: "test" });
  expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api"));
});
```

### Testing Netlify Functions

```typescript
import { createMockEvent, createMockContext } from "../mocks/netlify-event";
import { handler } from "../../netlify/functions/your-function";

it("should handle request", async () => {
  const event = createMockEvent({
    httpMethod: "POST",
    body: JSON.stringify({ data: "test" }),
  });
  const context = createMockContext();

  const response = await handler(event, context);

  expect(response.statusCode).toBe(200);
});
```

### Testing Email Services

```typescript
import * as emailFactory from "../../src/lib/email/factory";

it("should send email", async () => {
  const mockEmailService = {
    sendEmail: vi.fn().mockResolvedValue({
      success: true,
      messageId: "test-123",
    }),
  };

  vi.spyOn(emailFactory, "createEmailService").mockReturnValue(
    mockEmailService as any
  );

  // Test your code that uses the email service
});
```

## Test Coverage

We aim for:

- **80%+ code coverage** overall
- **100% coverage** for critical paths (authentication, email sending)
- **All edge cases** covered (errors, invalid inputs, timeouts)

### Coverage Reports

After running `pnpm test:coverage`, view the HTML report at:

```
coverage/index.html
```

## Best Practices

### Do's

✅ Test behavior, not implementation  
✅ Use descriptive test names  
✅ Test edge cases and error conditions  
✅ Keep tests independent  
✅ Mock external dependencies

### Don'ts

❌ Don't test third-party code  
❌ Don't make real API calls  
❌ Don't share state between tests  
❌ Don't write flaky tests

## Continuous Integration

Tests run automatically on:

- Every commit (via git hooks)
- Every pull request
- Before deployment

CI will fail if:

- Any test fails
- Coverage drops below threshold
- Linter errors exist

## Debugging Tests

### Run a specific test file

```bash
pnpm test tests/unit/parliament.test.ts
```

### Run tests matching a pattern

```bash
pnpm test -t "should find MP"
```

### Debug with console output

```typescript
it("should debug something", () => {
  console.log("Debug info:", someVariable);
  // Your test code
});
```

### Use the Vitest UI

```bash
pnpm test:ui
```

Opens a browser interface for visual test debugging.

## Adding New Tests

When adding a new feature:

1. **Write tests first** (TDD approach)
2. Add tests in the appropriate directory
3. Run tests locally before committing
4. Ensure coverage remains above threshold
5. Update this documentation if needed

## Common Issues

### TypeScript errors in tests

Make sure test files are included in `tsconfig.json`:

```json
{
  "include": ["src/**/*", "tests/**/*"]
}
```

### Mocks not working

Clear mocks before each test:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Async test timeouts

Increase timeout for slow tests:

```typescript
it("slow test", async () => {
  // Test code
}, 10000); // 10 second timeout
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Jest API (Vitest-compatible)](https://jestjs.io/docs/api)
