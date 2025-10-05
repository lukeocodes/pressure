# Dynamic Form Validation

This document describes the dynamic form validation feature that provides real-time verification for all form fields, including name, email, postcode, and MP lookup.

## Overview

The campaign form now includes comprehensive dynamic validation that:

1. Validates name field in real-time (minimum length and format)
2. Validates email address format in real-time
3. Verifies UK postcodes in real-time as users type
4. Displays visual feedback with a tick (✓) or cross (✗) icon for all fields
5. Automatically finds the user's MP once a valid postcode is entered
6. Shows MP details in an attractive card format
7. Only enables form submission once all fields are valid and MP is found

## User Experience Flow

### Step 1: User Enters Name

As the user types their name:

- Validation is instant (no delay)
- A green checkmark (✓) appears when valid
- A red cross (✗) appears with error message when invalid

**Validation Rules:**

- Must be at least 2 characters
- Must contain at least one letter
- Trimmed whitespace validation

### Step 2: User Enters Email

As the user types their email address:

- Validation is instant (no delay)
- A green checkmark (✓) appears when valid
- A red cross (✗) appears with error message when invalid

**Validation Rules:**

- Must follow valid email format (e.g., user@example.com)
- Uses comprehensive email regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Step 3: User Enters Postcode

As the user types their postcode:

- After a 500ms debounce (waiting for user to finish typing)
- A loading spinner appears next to the postcode field
- The system validates the postcode format
- An API call is made to verify the postcode

### Step 4: Postcode Verification

**Valid Postcode:**

- A green checkmark (✓) appears next to the input
- The postcode is automatically formatted (e.g., "SW1A1AA" → "SW1A 1AA")
- The system automatically finds the user's MP
- Validation is instant (no API call required for format check)
- MP details are displayed in a card below the form

**Invalid Postcode:**

- A red cross (✗) appears next to the input
- An error message explains the issue
- The submit button remains disabled

### Step 5: MP Details Display

Once a valid postcode is verified, the MP card shows:

- MP's name (in bold)
- Constituency name
- Political party

### Step 6: Form Submission

- Submit button is only enabled after all fields are validated:
  - Valid name (✓)
  - Valid email address (✓)
  - Valid postcode with MP found (✓)
  - Agreement checkbox checked
- No manual address entry is required
- Form submits with name, email, postcode, and MP details

## Technical Implementation

### Client-Side Validation

All field validation is performed entirely in the browser. No API calls are required for format validation.

**Name Validation Functions:**

- `validateName()` - Validates name format and length
  - Checks minimum 2 characters
  - Ensures at least one letter is present
  - Returns validation result with optional error message

**Email Validation Functions:**

- `validateEmail()` - Validates email format
  - Uses regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Returns validation result with optional error message

**Postcode Validation Functions:**

- `normalizePostcode()` - Removes spaces and converts to uppercase
- `formatPostcode()` - Adds proper spacing (e.g., "SW1A1AA" → "SW1A 1AA")
- `isValidPostcodeFormat()` - Validates using comprehensive regex pattern

### API Endpoints

#### `/api/find-mp` (POST)

Finds the MP for a given postcode using the Parliament API. The Parliament API can look up constituencies directly from postcodes.

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
    "name": "Nickie Aiken",
    "constituency": "Cities of London and Westminster",
    "party": "Conservative",
    "email": "nickie.aiken.mp@parliament.uk"
  }
}
```

### Frontend JavaScript

The form uses vanilla JavaScript with TypeScript for type safety:

**Key features:**

- Client-side regex validation for all fields (instant, no API call)
- Real-time validation for name and email fields
- Debounced input handler for postcode (500ms delay before MP lookup)
- State management for all field validations and MP data
- Visual feedback with loading/valid/invalid states for all fields
- Conditional form submission based on all field validations

**Validation Flow:**

1. User types name → instant validation with visual feedback
2. User types email → instant validation with visual feedback
3. User types postcode → after 500ms debounce, validate format with regex
4. If postcode valid, show loading spinner and call Parliament API
5. Display MP details or error message
6. Submit button enabled only when all fields valid and MP found

### Styling

The form includes custom CSS for:

- Input validation icons (✓, ✗, loading spinner)
- MP details card with professional appearance
- Responsive layout for mobile devices
- Accessible color schemes following WCAG guidelines

## Removed Features

### Address Field Removed

The address field has been removed from the form:

- **Reason:** Postcode provides sufficient constituent verification
- **Privacy:** Reduces data collection to minimum necessary
- **UX:** Simplifies form completion
- **Data Model:** `UserDetails` and `MagicLinkPayload` types updated

**Changed Types:**

```typescript
// Before
export interface UserDetails {
  name: string;
  email: string;
  postcode: string;
  address: string; // Removed
}

// After
export interface UserDetails {
  name: string;
  email: string;
  postcode: string;
}
```

## Validation Rules

### Name Format

**Requirements:**

- Minimum 2 characters
- Must contain at least one letter (a-z or A-Z)
- Leading and trailing whitespace is trimmed

**Error Messages:**

- "Please enter your name" - Empty field
- "Name must be at least 2 characters" - Too short
- "Name must contain letters" - No letters detected

### Email Format

**Requirements:**

- Must match email pattern: `username@domain.extension`
- No whitespace allowed
- Must contain @ symbol and domain with extension

**Regex Pattern:**

```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

**Error Messages:**

- "Please enter your email address" - Empty field
- "Please enter a valid email address" - Invalid format

### Postcode Format

Comprehensive UK postcode regex pattern:

```regex
^(?:(?:[A-PR-UWYZ][0-9]{1,2}|[A-PR-UWYZ][A-HK-Y][0-9]{1,2}|[A-PR-UWYZ][0-9][A-HJKSTUW]|[A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRV-Y])\ [0-9][ABD-HJLNP-UW-Z]{2}|GIR\ 0AA)$/i
```

This pattern validates:

- All standard UK postcode formats
- Special cases like `GIR 0AA` (Girobank)
- Correct character positions for outward and inward codes
- Valid area, district, sector, and unit combinations

**Valid examples:**

- SW1A 1AA
- EC1A 1BB
- W1A 0AX
- GIR 0AA (special case)
- M1 1AE
- B33 8TH
- CR2 6XH
- DN55 1PT

### Field-Specific Behavior

**Name and Email:**

- Validation triggers on every keystroke (instant feedback)
- Empty fields show no validation icon (neutral state)
- Invalid input immediately shows red X with error message
- Valid input immediately shows green checkmark

**Postcode:**

- Validation triggers after user stops typing for 500ms (debounced)
- Minimum 5 characters required before validation
- Shows loading spinner during MP lookup
- Shows checkmark when valid postcode and MP found

## Error Handling

### Common Errors

1. **Invalid Name**

   - Message: "Please enter your name" or "Name must be at least 2 characters" or "Name must contain letters"
   - User Action: Enter a valid name

2. **Invalid Email**

   - Message: "Please enter your email address" or "Please enter a valid email address"
   - User Action: Enter a valid email format

3. **Invalid Postcode Format**

   - Message: "Invalid or unrecognized postcode"
   - User Action: Correct the postcode format

4. **Postcode Not Found**

   - Message: "Invalid or unrecognized postcode"
   - User Action: Check spelling and try again

5. **MP Not Found**

   - Message: "Could not find your MP"
   - User Action: Contact support or verify postcode

6. **API Timeout**

   - Message: "An error occurred. Please try again."
   - User Action: Retry after a moment

7. **Form Submission Without Valid Fields**
   - Message: "Please enter a valid name" or "Please enter a valid email address" or "Please enter a valid UK postcode first"
   - User Action: Complete all required fields correctly

## Accessibility Features

- Form inputs include proper labels and ARIA attributes
- Visual feedback is complemented by text messages
- Keyboard navigation fully supported
- Focus states clearly visible
- Error messages announced to screen readers
- Color contrast meets WCAG AA standards

## Performance Considerations

- **Client-Side Validation:** Instant postcode format validation without any API calls
- **Debouncing:** Prevents excessive MP lookup API calls while typing (500ms delay)
- **Loading States:** Provides immediate visual feedback during MP lookup
- **Single API Dependency:** Only the Parliament API is required (no postcodes.io dependency)
- **Offline Support:** Postcode format validation works without internet connection
- **Reduced Network Traffic:** One less API call per validation
- **Faster UX:** Immediate format feedback, only network delay is for MP lookup

## Testing

Tests have been updated to reflect the removal of the address field:

- `tests/unit/send-magic-link.test.ts` - Updated
- `tests/unit/verify-and-send.test.ts` - Updated

## Future Enhancements

1. **Postcode Suggestions** - Autocomplete as user types
2. **Geolocation** - Use browser location to pre-fill postcode
3. **Offline Support** - Cache postcode data for offline validation
4. **Multiple MPs** - Handle postcodes with multiple representatives
5. **Historical Lookup** - Support for finding previous MPs

## Related Documentation

- [Postcode Validation Service](./Postcode%20Validation%20Service.md)
- [Campaign Configuration](./Campaign%20Configuration.md)
- [Email Templates](./Email%20Templates.md)
- [Testing](./Testing.md)
