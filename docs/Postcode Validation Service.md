# Postcode Validation Service

## Overview

Client-side UK postcode validation using a comprehensive regex pattern. No external API calls required for format validation.

## Why Client-Side?

1. **Instant validation** - No network latency
2. **Offline support** - Works without internet
3. **Privacy** - Postcode not sent externally until MP lookup
4. **No rate limits** - Unlimited validations
5. **Simplified architecture** - One less API dependency

## Functions

### `normalizePostcode(postcode: string): string`

Removes spaces and converts to uppercase.

```typescript
normalizePostcode("sw1a 1aa"); // "SW1A1AA"
```

### `formatPostcode(postcode: string): string`

Adds proper spacing to postcode.

```typescript
formatPostcode("SW1A1AA"); // "SW1A 1AA"
```

### `isValidPostcodeFormat(postcode: string): boolean`

Validates postcode format using comprehensive regex.

```typescript
isValidPostcodeFormat("SW1A 1AA"); // true
isValidPostcodeFormat("GIR 0AA"); // true (special case)
isValidPostcodeFormat("INVALID"); // false
```

## Regex Pattern

```regex
^(?:(?:[A-PR-UWYZ][0-9]{1,2}|[A-PR-UWYZ][A-HK-Y][0-9]{1,2}|[A-PR-UWYZ][0-9][A-HJKSTUW]|[A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRV-Y])\ [0-9][ABD-HJLNP-UW-Z]{2}|GIR\ 0AA)$/i
```

### Pattern Features

- Validates all standard UK postcode formats
- Handles special case `GIR 0AA` (Girobank)
- Enforces correct character positions
- Excludes invalid characters (Q, V, X in certain positions)

### Valid Examples

- `SW1A 1AA` - Standard format
- `M1 1AE` - Single letter area
- `B33 8TH` - Two digit district
- `CR2 6XH` - Standard format
- `DN55 1PT` - Two digit district
- `W1A 0AX` - BBC address
- `EC1A 1BB` - City of London
- `GIR 0AA` - Special Girobank postcode

## Usage in Application

### Frontend Form Validation

The validation is implemented directly in the `index.astro` page script:

1. User types postcode
2. After 500ms debounce, `isValidPostcodeFormat()` runs
3. If valid, green tick appears
4. Parliament API called to find MP
5. If invalid, red cross with error message

### Backend Formatting

When a user submits the form:

1. The postcode is sent to the `send-magic-link` function
2. `formatPostcode()` is called to ensure consistent formatting with standard UK spacing
3. The formatted postcode is stored in the JWT payload
4. When the email to MP is sent via `verify-and-send`, the formatted postcode is used in the template

This ensures all postcodes in emails are displayed with proper formatting (e.g., "SW1A 1AA" instead of "SW1A1AA")

## Migration from postcodes.io

Previously, the app used postcodes.io API for validation. Benefits of the new approach:

| Feature      | postcodes.io API   | Regex Validation |
| ------------ | ------------------ | ---------------- |
| Speed        | ~200-500ms         | < 1ms            |
| Offline      | ❌                 | ✅               |
| Dependencies | External API       | None             |
| Rate Limits  | Yes                | No               |
| Privacy      | Sends postcode     | Client-side only |
| Cost         | Free (with limits) | Free (unlimited) |

## Related Files

- `/src/lib/api/postcode.ts` - Validation functions
- `/src/pages/index.astro` - Form implementation
- `/src/lib/api/parliament.ts` - MP lookup (still uses Parliament API)

## Future Enhancements

- Export validation functions as reusable module
- Add TypeScript types for better IDE support
- Consider adding postcode suggestions/autocomplete
- Add validation for partial postcodes (outward code only)
