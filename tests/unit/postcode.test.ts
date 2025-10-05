import { describe, it, expect } from 'vitest';
import {
    normalizePostcode,
    formatPostcode,
    isValidPostcodeFormat,
} from '../../src/lib/api/postcode';

describe('Postcode Utilities', () => {
    describe('normalizePostcode', () => {
        it('should convert to uppercase', () => {
            expect(normalizePostcode('br8 7re')).toBe('BR87RE');
        });

        it('should remove spaces', () => {
            expect(normalizePostcode('BR8 7RE')).toBe('BR87RE');
            expect(normalizePostcode('B R 8  7 R E')).toBe('BR87RE');
        });

        it('should handle already normalized postcodes', () => {
            expect(normalizePostcode('BR87RE')).toBe('BR87RE');
        });
    });

    describe('formatPostcode', () => {
        it('should add space before last 3 characters', () => {
            expect(formatPostcode('BR87RE')).toBe('BR8 7RE');
            expect(formatPostcode('SW1A1AA')).toBe('SW1A 1AA');
        });

        it('should handle postcodes with spaces', () => {
            expect(formatPostcode('BR8 7RE')).toBe('BR8 7RE');
        });

        it('should handle short postcodes', () => {
            expect(formatPostcode('M1')).toBe('M1');
            expect(formatPostcode('M11AA')).toBe('M1 1AA');
        });
    });

    describe('isValidPostcodeFormat', () => {
        it('should validate correct UK postcode formats', () => {
            expect(isValidPostcodeFormat('BR8 7RE')).toBe(true);
            expect(isValidPostcodeFormat('BR87RE')).toBe(true);
            expect(isValidPostcodeFormat('SW1A 1AA')).toBe(true);
            expect(isValidPostcodeFormat('M1 1AA')).toBe(true);
            expect(isValidPostcodeFormat('B33 8TH')).toBe(true);
            expect(isValidPostcodeFormat('CR2 6XH')).toBe(true);
            expect(isValidPostcodeFormat('DN55 1PT')).toBe(true);
        });

        it('should reject invalid postcode formats', () => {
            expect(isValidPostcodeFormat('INVALID')).toBe(false);
            expect(isValidPostcodeFormat('12345')).toBe(false);
            expect(isValidPostcodeFormat('ABC')).toBe(false);
            expect(isValidPostcodeFormat('')).toBe(false);
            expect(isValidPostcodeFormat('BR8')).toBe(false);
        });

        it('should handle case insensitive validation', () => {
            expect(isValidPostcodeFormat('br8 7re')).toBe(true);
            expect(isValidPostcodeFormat('Br8 7Re')).toBe(true);
        });
    });
});

