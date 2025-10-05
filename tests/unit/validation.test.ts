import { describe, it, expect } from 'vitest';
import {
    validateName,
    validateEmail,
    validatePostcode,
    validateMPData,
    validateUserSubmission,
    normalizePostcode,
    formatPostcode,
} from '../../src/lib/validation';

describe('Validation Module', () => {
    describe('validateName', () => {
        it('should accept valid names', () => {
            expect(validateName('John Doe').valid).toBe(true);
            expect(validateName('Jane').valid).toBe(true);
            expect(validateName('O\'Brien').valid).toBe(true);
            expect(validateName('Mary-Jane').valid).toBe(true);
            expect(validateName('José García').valid).toBe(true);
        });

        it('should reject empty names', () => {
            const result = validateName('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please enter your name');
        });

        it('should reject names with only whitespace', () => {
            const result = validateName('   ');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please enter your name');
        });

        it('should reject names shorter than 2 characters', () => {
            const result = validateName('J');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Name must be at least 2 characters');
        });

        it('should reject names without letters', () => {
            const result = validateName('123');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Name must contain letters');
        });

        it('should trim whitespace', () => {
            expect(validateName('  John Doe  ').valid).toBe(true);
        });
    });

    describe('validateEmail', () => {
        it('should accept valid email addresses', () => {
            expect(validateEmail('john@example.com').valid).toBe(true);
            expect(validateEmail('jane.doe@company.co.uk').valid).toBe(true);
            expect(validateEmail('user+tag@domain.org').valid).toBe(true);
            expect(validateEmail('test_user@sub.domain.com').valid).toBe(true);
        });

        it('should reject empty email', () => {
            const result = validateEmail('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please enter your email address');
        });

        it('should reject email with only whitespace', () => {
            const result = validateEmail('   ');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please enter your email address');
        });

        it('should reject invalid email formats', () => {
            const invalidEmails = [
                'notanemail',
                '@example.com',
                'user@',
                'user @example.com',
            ];

            invalidEmails.forEach((email) => {
                const result = validateEmail(email);
                expect(result.valid).toBe(false);
                expect(result.error).toBe('Please enter a valid email address');
            });
        });

        it('should trim whitespace', () => {
            expect(validateEmail('  john@example.com  ').valid).toBe(true);
        });
    });

    describe('normalizePostcode', () => {
        it('should convert to uppercase', () => {
            expect(normalizePostcode('sw1a 1aa')).toBe('SW1A1AA');
        });

        it('should remove spaces', () => {
            expect(normalizePostcode('SW1A 1AA')).toBe('SW1A1AA');
            expect(normalizePostcode('S W 1 A   1 A A')).toBe('SW1A1AA');
        });

        it('should handle already normalized postcodes', () => {
            expect(normalizePostcode('SW1A1AA')).toBe('SW1A1AA');
        });
    });

    describe('formatPostcode', () => {
        it('should add space before last 3 characters', () => {
            expect(formatPostcode('SW1A1AA')).toBe('SW1A 1AA');
            expect(formatPostcode('EC1A1BB')).toBe('EC1A 1BB');
            expect(formatPostcode('M11AE')).toBe('M1 1AE');
        });

        it('should handle postcodes with existing spacing', () => {
            expect(formatPostcode('SW1A 1AA')).toBe('SW1A 1AA');
        });

        it('should handle lowercase postcodes', () => {
            expect(formatPostcode('sw1a1aa')).toBe('SW1A 1AA');
        });

        it('should handle postcodes shorter than 5 characters', () => {
            expect(formatPostcode('ABC')).toBe('ABC');
        });
    });

    describe('validatePostcode', () => {
        it('should accept valid UK postcodes', () => {
            const validPostcodes = [
                'SW1A 1AA',
                'EC1A 1BB',
                'W1A 0AX',
                'M1 1AE',
                'B33 8TH',
                'CR2 6XH',
                'DN55 1PT',
                'GIR 0AA', // Special case
            ];

            validPostcodes.forEach((postcode) => {
                const result = validatePostcode(postcode);
                expect(result.valid).toBe(true);
            });
        });

        it('should accept valid postcodes without spacing', () => {
            expect(validatePostcode('SW1A1AA').valid).toBe(true);
            expect(validatePostcode('EC1A1BB').valid).toBe(true);
        });

        it('should accept lowercase postcodes', () => {
            expect(validatePostcode('sw1a 1aa').valid).toBe(true);
            expect(validatePostcode('ec1a1bb').valid).toBe(true);
        });

        it('should reject empty postcode', () => {
            const result = validatePostcode('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please enter your postcode');
        });

        it('should reject postcode with only whitespace', () => {
            const result = validatePostcode('   ');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please enter your postcode');
        });

        it('should reject postcodes that are too short', () => {
            const result = validatePostcode('SW1');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Postcode is too short');
        });

        it('should reject invalid postcode formats', () => {
            const invalidPostcodes = [
                'INVALID',
                '12345',
                'SW1A 1A',  // Too short
            ];

            invalidPostcodes.forEach((postcode) => {
                const result = validatePostcode(postcode);
                expect(result.valid).toBe(false);
                expect(result.error).toBe('Invalid UK postcode format');
            });
        });
    });

    describe('validateMPData', () => {
        const validMP = {
            name: 'Jane Smith MP',
            email: 'jane.smith.mp@parliament.uk',
            constituency: 'Test Constituency',
            party: 'Labour',
        };

        it('should accept valid MP data', () => {
            expect(validateMPData(validMP).valid).toBe(true);
        });

        it('should reject null or undefined', () => {
            expect(validateMPData(null).valid).toBe(false);
            expect(validateMPData(undefined).valid).toBe(false);
        });

        it('should reject non-object values', () => {
            expect(validateMPData('string').valid).toBe(false);
            expect(validateMPData(123).valid).toBe(false);
            expect(validateMPData([]).valid).toBe(false);
        });

        it('should reject MP without name', () => {
            const result = validateMPData({ ...validMP, name: '' });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('MP name is required');
        });

        it('should reject MP without constituency', () => {
            const result = validateMPData({ ...validMP, constituency: '' });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('MP constituency is required');
        });

        it('should reject MP without email', () => {
            const result = validateMPData({ ...validMP, email: '' });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('MP email is required');
        });

        it('should reject MP with invalid email', () => {
            const result = validateMPData({ ...validMP, email: 'invalid-email' });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid MP email address');
        });

        it('should trim whitespace from fields', () => {
            const mpWithWhitespace = {
                name: '  Jane Smith MP  ',
                email: '  jane@parliament.uk  ',
                constituency: '  Test  ',
                party: 'Labour',
            };
            expect(validateMPData(mpWithWhitespace).valid).toBe(true);
        });
    });

    describe('validateUserSubmission', () => {
        const validSubmission = {
            name: 'John Doe',
            email: 'john@example.com',
            postcode: 'SW1A 1AA',
            mp: {
                name: 'Jane Smith MP',
                email: 'jane.smith.mp@parliament.uk',
                constituency: 'Test Constituency',
                party: 'Labour',
            },
        };

        it('should accept valid submission', () => {
            expect(validateUserSubmission(validSubmission).valid).toBe(true);
        });

        it('should reject invalid name', () => {
            const result = validateUserSubmission({
                ...validSubmission,
                name: 'J',
            });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Name must be at least 2 characters');
        });

        it('should reject invalid email', () => {
            const result = validateUserSubmission({
                ...validSubmission,
                email: 'invalid',
            });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please enter a valid email address');
        });

        it('should reject invalid postcode', () => {
            const result = validateUserSubmission({
                ...validSubmission,
                postcode: 'INVALID',
            });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid UK postcode format');
        });

        it('should reject invalid MP data', () => {
            const result = validateUserSubmission({
                ...validSubmission,
                mp: { ...validSubmission.mp, email: '' },
            });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('MP email is required');
        });

        it('should validate fields in order (name first)', () => {
            const result = validateUserSubmission({
                name: '',
                email: 'invalid',
                postcode: 'BAD',
                mp: null as any,
            });
            // Should fail on name first
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please enter your name');
        });
    });

    describe('Integration: Client-Server Consistency', () => {
        it('should use same validation for client and server', () => {
            // This test ensures the validation module can be imported
            // and used consistently across client and server
            const testData = {
                name: 'Test User',
                email: 'test@example.com',
                postcode: 'SW1A 1AA',
                mp: {
                    name: 'Test MP',
                    email: 'mp@parliament.uk',
                    constituency: 'Test',
                    party: 'Test',
                },
            };

            // Same validation should work everywhere
            const result = validateUserSubmission(testData);
            expect(result.valid).toBe(true);

            // Individual validations should also work
            expect(validateName(testData.name).valid).toBe(true);
            expect(validateEmail(testData.email).valid).toBe(true);
            expect(validatePostcode(testData.postcode).valid).toBe(true);
            expect(validateMPData(testData.mp).valid).toBe(true);
        });
    });
});

