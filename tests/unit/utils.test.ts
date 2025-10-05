import { describe, it, expect } from 'vitest';
import { isValidPostcode, isValidEmail, sanitizeHtml, generateToken } from '../../src/lib/utils';

describe('Utility Functions', () => {
    describe('isValidPostcode', () => {
        it('should validate correct UK postcodes', () => {
            expect(isValidPostcode('SW1A 1AA')).toBe(true);
            expect(isValidPostcode('M1 1AE')).toBe(true);
            expect(isValidPostcode('B33 8TH')).toBe(true);
            expect(isValidPostcode('CR2 6XH')).toBe(true);
            expect(isValidPostcode('DN55 1PT')).toBe(true);
            expect(isValidPostcode('W1A 0AX')).toBe(true);
            expect(isValidPostcode('EC1A 1BB')).toBe(true);
        });

        it('should validate postcodes without spaces', () => {
            expect(isValidPostcode('SW1A1AA')).toBe(true);
            expect(isValidPostcode('M11AE')).toBe(true);
        });

        it('should accept lowercase postcodes', () => {
            expect(isValidPostcode('sw1a 1aa')).toBe(true);
            expect(isValidPostcode('m1 1ae')).toBe(true);
        });

        it('should reject invalid postcodes', () => {
            expect(isValidPostcode('INVALID')).toBe(false);
            expect(isValidPostcode('12345')).toBe(false);
            expect(isValidPostcode('A')).toBe(false);
            expect(isValidPostcode('')).toBe(false);
            expect(isValidPostcode('SW1A 1AAA')).toBe(false); // Too long
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct email addresses', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@example.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@example.com')).toBe(true);
            expect(isValidEmail('user_name@example-domain.com')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('invalid@')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('invalid@example')).toBe(false);
            expect(isValidEmail('')).toBe(false);
            expect(isValidEmail('invalid @example.com')).toBe(false);
        });
    });

    describe('sanitizeHtml', () => {
        it('should escape HTML special characters', () => {
            expect(sanitizeHtml('<script>alert("xss")</script>'))
                .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

            expect(sanitizeHtml('<img src="x" onerror="alert(1)">'))
                .toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');

            expect(sanitizeHtml("It's a test & <test>"))
                .toBe('It&#039;s a test &amp; &lt;test&gt;');
        });

        it('should handle plain text', () => {
            expect(sanitizeHtml('Hello World')).toBe('Hello World');
            expect(sanitizeHtml('123 ABC xyz')).toBe('123 ABC xyz');
        });

        it('should handle empty strings', () => {
            expect(sanitizeHtml('')).toBe('');
        });
    });

    describe('generateToken', () => {
        it('should generate a token of correct length', () => {
            const token = generateToken();
            expect(token).toHaveLength(32);
        });

        it('should generate unique tokens', () => {
            const token1 = generateToken();
            const token2 = generateToken();
            expect(token1).not.toBe(token2);
        });

        it('should generate URL-safe tokens', () => {
            const token = generateToken();
            expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
        });
    });
});

