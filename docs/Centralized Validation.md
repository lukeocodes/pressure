# Centralized Validation

This document describes the centralized validation system that ensures consistent validation rules across client-side and server-side code.

## Overview

All validation logic is centralized in a single module (`src/lib/validation.ts`) that is used by:

1. **Client-side code** - Frontend forms in `src/pages/index.astro`
2. **Server-side code** - Netlify functions for API validation
3. **Tests** - Comprehensive test coverage for all validation rules

This approach ensures that validation rules are defined once and applied consistently everywhere, preventing drift between frontend and backend validation.

## Benefits

### Single Source of Truth

- Validation rules are defined in one place
- Changes to validation automatically apply everywhere
- No risk of frontend and backend validation diverging

### Type Safety

- TypeScript ensures consistent data structures
- Validation functions have well-defined interfaces
- IDE autocomplete and type checking for all validation

### Testability

- Centralized tests cover all validation scenarios
- Easy to add new validation rules with confidence
- Test once, validate everywhere

### Maintainability

- Easy to find and update validation logic
- Clear documentation of validation rules
- Consistent error messages across the application

## Architecture

```
src/lib/validation.ts (single source of truth)
    ↓
    ├── Client-side (src/pages/index.astro)
    │   ├── Real-time name validation
    │   ├── Real-time email validation
    │   └── Real-time postcode validation
    │
    ├── Server-side (netlify/functions/)
    │   ├── send-magic-link.ts → validateUserSubmission()
    │   ├── preview-email.ts → individual validators
    │   └── verify-and-send.ts → (uses validated JWT payload)
    │
    └── Tests (tests/unit/validation.test.ts)
        └── Comprehensive test coverage
```

## Validation Module

### Location

`src/lib/validation.ts`

### Exported Functions

#### `validateName(name: string): ValidationResult`

Validates user name field.

**Rules:**

- Must not be undefined or empty
- Must be at least 2 characters (after trimming)
- Must contain at least one letter

**Error Messages:**

- "Please enter your name" - Missing or empty
- "Name must be at least 2 characters" - Too short
- "Name must contain letters" - No alphabetic characters

#### `validateEmail(email: string): ValidationResult`

Validates email address.

**Rules:**

- Must not be undefined or empty
- Must match email pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Error Messages:**

- "Please enter your email address" - Missing or empty
- "Please enter a valid email address" - Invalid format

#### `validatePostcode(postcode: string): ValidationResult`

Validates UK postcode format.

**Rules:**

- Must not be undefined or empty
- Must be at least 5 characters
- Must match UK postcode pattern (comprehensive regex)

**Error Messages:**

- "Please enter your postcode" - Missing or empty
- "Postcode is too short" - Less than 5 characters
- "Invalid UK postcode format" - Doesn't match pattern

#### `normalizePostcode(postcode: string): string`

Removes spaces and converts to uppercase.

**Example:**

```typescript
normalizePostcode("sw1a 1aa"); // Returns: "SW1A1AA"
```

#### `formatPostcode(postcode: string): string`

Formats postcode with standard UK spacing.

**Example:**

```typescript
formatPostcode("SW1A1AA"); // Returns: "SW1A 1AA"
formatPostcode("sw1a1aa"); // Returns: "SW1A 1AA"
```

#### `validateMPData(mp: any): ValidationResult`

Validates MP data structure.

**Rules:**

- Must be a non-null object
- Must have `name` (non-empty string)
- Must have `constituency` (non-empty string)
- Must have `email` (non-empty string)
- Email must be valid format

**Error Messages:**

- "Invalid MP data" - Not an object
- "MP name is required" - Missing or empty name
- "MP constituency is required" - Missing or empty constituency
- "MP email is required" - Missing or empty email
- "Invalid MP email address" - Invalid email format

#### `validateUserSubmission(submission: UserSubmission): ValidationResult`

Validates complete user submission (all fields together).

**Interface:**

```typescript
interface UserSubmission {
  name: string;
  email: string;
  postcode: string;
  mp: any;
}
```

**Behavior:**

- Validates fields in order: name → email → postcode → MP data
- Returns first validation error encountered
- Returns `{ valid: true }` if all fields are valid

## Client-Side Usage

### In Astro Pages

```typescript
// Import from centralized validation
import {
  validateName,
  validateEmail,
  validatePostcode,
  formatPostcode,
} from "../lib/validation";

// Use in event handlers
nameInput.addEventListener("input", () => {
  const validation = validateName(nameInput.value);

  if (validation.valid) {
    // Show success indicator
    nameStatus.className = "validation-icon valid";
    nameError.style.display = "none";
  } else {
    // Show error
    nameStatus.className = "validation-icon invalid";
    nameError.textContent = validation.error;
    nameError.style.display = "block";
  }
});
```

## Server-Side Usage

### In Netlify Functions

```typescript
import { validateUserSubmission } from "../../src/lib/validation";

export const handler = async (event, context) => {
  const { name, email, postcode, mp } = JSON.parse(event.body || "{}");

  // Validate using centralized validation
  const validation = validateUserSubmission({ name, email, postcode, mp });

  if (!validation.valid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: validation.error }),
    };
  }

  // Proceed with validated data
  // ...
};
```

### Individual Field Validation

For endpoints that only need to validate specific fields:

```typescript
import {
  validateName,
  validateEmail,
  validatePostcode,
} from "../../src/lib/validation";

// Validate individual fields
const nameValidation = validateName(name);
if (!nameValidation.valid) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: nameValidation.error }),
  };
}
```

## ValidationResult Interface

All validation functions return a consistent result:

```typescript
interface ValidationResult {
  valid: boolean; // true if validation passed
  error?: string; // error message if validation failed
}
```

**Usage:**

```typescript
const result = validateEmail("test@example.com");

if (result.valid) {
  console.log("Email is valid!");
} else {
  console.log("Error:", result.error);
}
```

## Backwards Compatibility

The `src/lib/api/postcode.ts` module now re-exports from the centralized validation:

```typescript
// Re-exports for backwards compatibility
export {
  normalizePostcode,
  formatPostcode,
  validatePostcode,
} from "../validation";

// Deprecated function (still works for existing code)
export function isValidPostcodeFormat(postcode: string): boolean {
  const { valid } = validatePostcodeFromValidation(postcode);
  return valid;
}
```

Existing code using `isValidPostcodeFormat()` will continue to work, but new code should use `validatePostcode()` for consistent error messages.

## Testing

### Test Coverage

Comprehensive tests in `tests/unit/validation.test.ts` cover:

- Valid inputs for all fields
- Invalid inputs with correct error messages
- Edge cases (empty, whitespace, special characters)
- Type checking (undefined, null, non-string values)
- Trimming and formatting
- Integration between validation functions

### Running Tests

```bash
npm test -- validation.test.ts
```

### Example Test

```typescript
it("should reject invalid email formats", () => {
  const result = validateEmail("not-an-email");
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Please enter a valid email address");
});
```

## Error Handling

### Undefined/Null Values

All validation functions safely handle undefined and null values:

```typescript
validateName(undefined); // Returns: { valid: false, error: "Please enter your name" }
validateEmail(null); // Returns: { valid: false, error: "Please enter your email address" }
validatePostcode(""); // Returns: { valid: false, error: "Please enter your postcode" }
```

### Type Checking

Functions check types before processing:

```typescript
validateName(123); // Returns: { valid: false, error: "Please enter your name" }
validateEmail(["array"]); // Returns: { valid: false, error: "Please enter your email address" }
```

## Validation Flow

### Client-Side

1. User types in form field
2. Event listener triggers validation function
3. Validation result updates UI (icon + error message)
4. Submit button enabled/disabled based on all validations

### Server-Side

1. API receives request
2. Parse request body
3. Run validation function(s)
4. Return 400 error if validation fails
5. Process request if validation succeeds

### Consistency

Both client and server use the **exact same validation functions**, ensuring:

- Same error messages everywhere
- Same validation rules everywhere
- No unexpected server rejections
- Better user experience

## Adding New Validation Rules

To add a new validation rule:

1. **Add function to `src/lib/validation.ts`:**

```typescript
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Please enter your phone number" };
  }

  const phonePattern = /^[\d\s\-\+\(\)]+$/;
  if (!phonePattern.test(phone.trim())) {
    return { valid: false, error: "Please enter a valid phone number" };
  }

  return { valid: true };
}
```

2. **Add tests to `tests/unit/validation.test.ts`:**

```typescript
describe("validatePhoneNumber", () => {
  it("should accept valid phone numbers", () => {
    expect(validatePhoneNumber("+44 20 1234 5678").valid).toBe(true);
  });

  it("should reject invalid phone numbers", () => {
    const result = validatePhoneNumber("abc");
    expect(result.valid).toBe(false);
  });
});
```

3. **Use in client and server code:**

```typescript
// Client-side
import { validatePhoneNumber } from "../lib/validation";

// Server-side
import { validatePhoneNumber } from "../../src/lib/validation";
```

## Best Practices

### Do

✅ Always use centralized validation functions  
✅ Check `ValidationResult.valid` before using data  
✅ Display `ValidationResult.error` to users  
✅ Handle undefined/null values gracefully  
✅ Write tests for new validation rules

### Don't

❌ Duplicate validation logic in multiple places  
❌ Assume validation will pass  
❌ Skip server-side validation (even if client validates)  
❌ Create custom error messages that differ from validation functions  
❌ Forget to update tests when changing validation rules

## Security Considerations

### Defense in Depth

- Always validate on server, even if client validates
- Client validation improves UX but doesn't provide security
- Server validation is the security boundary

### Input Sanitization

- Validation checks format, not security
- Additional sanitization may be needed for specific contexts
- HTML escaping, SQL parameterization handled separately

### Rate Limiting

- Validation itself doesn't prevent abuse
- Implement rate limiting at API layer
- Consider CAPTCHA for public forms

## Future Enhancements

1. **Async Validation** - Support for API-based validation (e.g., check if email already exists)
2. **Custom Validators** - Allow campaigns to add custom validation rules
3. **Internationalization** - Support multiple languages for error messages
4. **Field Dependencies** - Validate based on other field values
5. **Progressive Validation** - Show hints before errors
6. **Accessibility** - ARIA announcements for validation errors

## Related Documentation

- [Dynamic Form Validation](./Dynamic%20Form%20Validation.md) - UI validation behavior
- [Email Preview API](./Email%20Preview%20API.md) - Preview endpoint validation
- [Testing](./Testing.md) - Testing strategy
- [Postcode Validation Service](./Postcode%20Validation%20Service.md) - Postcode-specific details
