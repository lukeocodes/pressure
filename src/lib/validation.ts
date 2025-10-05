/**
 * Centralized validation module
 * Used by both client-side and server-side (Netlify functions)
 * Ensures consistent validation rules across the application
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate name field
 * Rules:
 * - Must not be empty (after trimming)
 * - Must be at least 2 characters
 * - Must contain at least one letter
 */
export function validateName(name: string): ValidationResult {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: "Please enter your name" };
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
        return { valid: false, error: "Please enter your name" };
    }

    if (trimmedName.length < 2) {
        return { valid: false, error: "Name must be at least 2 characters" };
    }

    // Check if name contains at least one letter
    if (!/[a-zA-Z]/.test(trimmedName)) {
        return { valid: false, error: "Name must contain letters" };
    }

    return { valid: true };
}

/**
 * Validate email address
 * Rules:
 * - Must not be empty (after trimming)
 * - Must match valid email format
 */
export function validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: "Please enter your email address" };
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length === 0) {
        return { valid: false, error: "Please enter your email address" };
    }

    // Comprehensive email regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
        return { valid: false, error: "Please enter a valid email address" };
    }

    return { valid: true };
}

/**
 * Normalize UK postcode format (remove spaces, uppercase)
 */
export function normalizePostcode(postcode: string): string {
    return postcode.toUpperCase().replace(/\s+/g, '');
}

/**
 * Format UK postcode with standard spacing (e.g., "SW1A1AA" -> "SW1A 1AA")
 */
export function formatPostcode(postcode: string): string {
    const normalized = normalizePostcode(postcode);
    // Add space before last 3 characters
    if (normalized.length >= 5) {
        return `${normalized.slice(0, -3)} ${normalized.slice(-3)}`;
    }
    return normalized;
}

/**
 * Validate UK postcode format
 * Rules:
 * - Must not be empty (after trimming)
 * - Must match UK postcode pattern
 */
export function validatePostcode(postcode: string): ValidationResult {
    if (!postcode || typeof postcode !== 'string') {
        return { valid: false, error: "Please enter your postcode" };
    }

    const trimmedPostcode = postcode.trim();

    if (trimmedPostcode.length === 0) {
        return { valid: false, error: "Please enter your postcode" };
    }

    if (trimmedPostcode.length < 5) {
        return { valid: false, error: "Postcode is too short" };
    }

    // Comprehensive UK postcode regex pattern
    const pattern = /^(?:(?:[A-PR-UWYZ][0-9]{1,2}|[A-PR-UWYZ][A-HK-Y][0-9]{1,2}|[A-PR-UWYZ][0-9][A-HJKSTUW]|[A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRV-Y])\ [0-9][ABD-HJLNP-UW-Z]{2}|GIR\ 0AA)$/i;

    // Format the postcode with proper spacing before validation
    const formatted = formatPostcode(trimmedPostcode);

    if (!pattern.test(formatted)) {
        return { valid: false, error: "Invalid UK postcode format" };
    }

    return { valid: true };
}

/**
 * Validate MP data structure
 * Rules:
 * - Must have name
 * - Must have constituency
 * - Must have email
 * - Must have party
 */
export function validateMPData(mp: any): ValidationResult {
    if (!mp || typeof mp !== 'object') {
        return { valid: false, error: "Invalid MP data" };
    }

    if (!mp.name || typeof mp.name !== 'string' || mp.name.trim().length === 0) {
        return { valid: false, error: "MP name is required" };
    }

    if (!mp.constituency || typeof mp.constituency !== 'string' || mp.constituency.trim().length === 0) {
        return { valid: false, error: "MP constituency is required" };
    }

    if (!mp.email || typeof mp.email !== 'string' || mp.email.trim().length === 0) {
        return { valid: false, error: "MP email is required" };
    }

    // Validate MP email format
    const emailValidation = validateEmail(mp.email);
    if (!emailValidation.valid) {
        return { valid: false, error: "Invalid MP email address" };
    }

    return { valid: true };
}

/**
 * Validate complete user submission
 * Validates all fields together for server-side validation
 */
export interface UserSubmission {
    name: string;
    email: string;
    postcode: string;
    mp: any;
}

export function validateUserSubmission(submission: UserSubmission): ValidationResult {
    // Validate name
    const nameValidation = validateName(submission.name);
    if (!nameValidation.valid) {
        return nameValidation;
    }

    // Validate email
    const emailValidation = validateEmail(submission.email);
    if (!emailValidation.valid) {
        return emailValidation;
    }

    // Validate postcode
    const postcodeValidation = validatePostcode(submission.postcode);
    if (!postcodeValidation.valid) {
        return postcodeValidation;
    }

    // Validate MP data
    const mpValidation = validateMPData(submission.mp);
    if (!mpValidation.valid) {
        return mpValidation;
    }

    return { valid: true };
}

