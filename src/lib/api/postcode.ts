/**
 * UK Postcode validation utilities
 * Re-exports from centralized validation module for backwards compatibility
 */

import { validatePostcode as validatePostcodeFromValidation } from '../validation';

export {
    normalizePostcode,
    formatPostcode,
    validatePostcode,
} from '../validation';

/**
 * Validate UK postcode format using comprehensive regex
 * Matches all valid UK postcode patterns including special cases like GIR 0AA
 * 
 * @deprecated Use validatePostcode() instead for consistent error messages
 */
export function isValidPostcodeFormat(postcode: string): boolean {
    const { valid } = validatePostcodeFromValidation(postcode);
    return valid;
}


