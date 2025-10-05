import { nanoid } from 'nanoid';
import campaignConfig from '../campaigns/config.json';
import type { Campaign } from './types';

/**
 * Load campaign configuration
 */
export function getCampaign(): Campaign {
    return campaignConfig as Campaign;
}

/**
 * Generate a secure random token
 */
export function generateToken(): string {
    return nanoid(32);
}

/**
 * Validate UK postcode format
 */
export function isValidPostcode(postcode: string): boolean {
    const regex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    return regex.test(postcode.trim());
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
    // Basic sanitization - in production, consider using a library like DOMPurify
    return html
        .replace(/&/g, '&amp;')  // Must be first to avoid double-escaping
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

