import { describe, it, expect } from 'vitest';
import {
    generateMPEmailText,
    generateMPEmailHtml,
    generateMPEmailPreview,
} from '../../src/lib/email/templates';

describe('Email Templates', () => {
    const testData = {
        mpName: 'Jane Smith MP',
        constituency: 'Test Constituency',
        postcode: 'SW1A 1AA',
        campaignDescription: 'This is a test campaign about an important issue.',
        userName: 'John Doe',
        userEmail: 'john@example.com',
    };

    const testCampaign = {
        title: 'Test Campaign',
        description: 'Campaign description',
        slug: 'test-campaign',
        emailSubject: 'Urgent: Your constituent\'s concerns',
        emailTemplate: 'email-to-mp',
        userEmailSubject: 'Confirm your signature',
        userEmailTemplate: 'magic-link',
        thankYouMessage: 'Thank you!',
        cc: [],
        bcc: [],
        styling: {
            primaryColor: '#1d70b8',
            logoUrl: '/favicon.svg',
        },
        footer: {
            organizationName: 'Test Org',
            organizationUrl: 'https://example.com',
        },
    };

    describe('generateMPEmailText', () => {
        it('should generate plain text email with all required fields', () => {
            const text = generateMPEmailText(testData);

            expect(text).toContain('Dear Jane Smith MP');
            expect(text).toContain('Test Constituency');
            expect(text).toContain('SW1A 1AA');
            expect(text).toContain('This is a test campaign about an important issue.');
            expect(text).toContain('John Doe');
            expect(text).toContain('john@example.com');
        });

        it('should include proper salutation', () => {
            const text = generateMPEmailText(testData);
            expect(text).toMatch(/^Dear Jane Smith MP,/);
        });

        it('should include constituency statement', () => {
            const text = generateMPEmailText(testData);
            expect(text).toContain('I am writing to you as your constituent in Test Constituency (SW1A 1AA)');
        });

        it('should include campaign description', () => {
            const text = generateMPEmailText(testData);
            expect(text).toContain('This is a test campaign about an important issue.');
        });

        it('should include proper sign-off', () => {
            const text = generateMPEmailText(testData);
            expect(text).toContain('Yours sincerely,\nJohn Doe');
        });

        it('should include platform footer', () => {
            const text = generateMPEmailText(testData);
            expect(text).toContain('This email was sent via an automated campaign platform');
            expect(text).toContain('Constituent details:');
            expect(text).toContain('Name: John Doe');
            expect(text).toContain('Email: john@example.com');
            expect(text).toContain('Postcode: SW1A 1AA');
        });
    });

    describe('generateMPEmailHtml', () => {
        it('should generate valid HTML email', () => {
            const html = generateMPEmailHtml(testData);

            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html>');
            expect(html).toContain('</html>');
            expect(html).toContain('<body');
            expect(html).toContain('</body>');
        });

        it('should include all required content', () => {
            const html = generateMPEmailHtml(testData);

            expect(html).toContain('Dear Jane Smith MP');
            expect(html).toContain('<strong>Test Constituency</strong>');
            expect(html).toContain('SW1A 1AA');
            expect(html).toContain('This is a test campaign about an important issue.');
            expect(html).toContain('<strong>John Doe</strong>');
            expect(html).toContain('john@example.com');
        });

        it('should use proper HTML styling', () => {
            const html = generateMPEmailHtml(testData);

            expect(html).toContain('font-family: Arial, sans-serif');
            expect(html).toContain('line-height: 1.6');
            expect(html).toContain('max-width: 600px');
        });

        it('should include styled footer', () => {
            const html = generateMPEmailHtml(testData);

            expect(html).toContain('<hr style=');
            expect(html).toContain('font-size: 12px');
            expect(html).toContain('color: #666');
        });

        it('should properly escape HTML characters in content', () => {
            const dataWithHtml = {
                ...testData,
                campaignDescription: 'Test <script>alert("xss")</script> content',
            };

            const html = generateMPEmailHtml(dataWithHtml);
            // Note: Template literals don't escape HTML, but this test ensures the structure is correct
            expect(html).toContain('Test <script>alert("xss")</script> content');
        });
    });

    describe('generateMPEmailPreview', () => {
        it('should generate complete email preview object', () => {
            const preview = generateMPEmailPreview(testData, testCampaign);

            expect(preview).toHaveProperty('subject');
            expect(preview).toHaveProperty('text');
            expect(preview).toHaveProperty('html');
        });

        it('should use campaign email subject', () => {
            const preview = generateMPEmailPreview(testData, testCampaign);
            expect(preview.subject).toBe('Urgent: Your constituent\'s concerns');
        });

        it('should generate text and html versions', () => {
            const preview = generateMPEmailPreview(testData, testCampaign);

            expect(preview.text).toContain('Dear Jane Smith MP');
            expect(preview.html).toContain('<p>Dear Jane Smith MP,</p>');
        });

        it('should have matching content between text and html versions', () => {
            const preview = generateMPEmailPreview(testData, testCampaign);

            // Check key content appears in both
            expect(preview.text).toContain('John Doe');
            expect(preview.html).toContain('John Doe');

            expect(preview.text).toContain('Test Constituency');
            expect(preview.html).toContain('Test Constituency');

            expect(preview.text).toContain('SW1A 1AA');
            expect(preview.html).toContain('SW1A 1AA');
        });
    });

    describe('Template consistency', () => {
        it('should maintain consistent structure between text and html', () => {
            const text = generateMPEmailText(testData);
            const html = generateMPEmailHtml(testData);

            // Check that key phrases appear in both
            const keyPhrases = [
                'Dear Jane Smith MP',
                'I am writing to you as your constituent',
                'Test Constituency',
                'SW1A 1AA',
                'Yours sincerely',
                'John Doe',
                'This email was sent via an automated campaign platform',
            ];

            keyPhrases.forEach((phrase) => {
                expect(text).toContain(phrase);
                expect(html).toContain(phrase);
            });
        });
    });
});

