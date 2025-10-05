import type { EmailOptions, EmailResult } from '../types';

/**
 * Abstract email service interface
 * All email providers must implement this interface
 */
export interface EmailService {
  sendEmail(options: EmailOptions): Promise<EmailResult>;
}

/**
 * Base email service with common functionality
 */
export abstract class BaseEmailService implements EmailService {
  protected fromEmail: string;
  protected fromName: string;
  
  constructor(fromEmail: string, fromName: string) {
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }
  
  abstract sendEmail(options: EmailOptions): Promise<EmailResult>;
  
  /**
   * Normalize recipient list to array
   */
  protected normalizeRecipients(recipients: string | string[]): string[] {
    return Array.isArray(recipients) ? recipients : [recipients];
  }
  
  /**
   * Get sender email with fallback
   */
  protected getSender(from?: string): string {
    return from || this.fromEmail;
  }
  
  /**
   * Get sender name with fallback
   */
  protected getSenderName(fromName?: string): string {
    return fromName || this.fromName;
  }
}

