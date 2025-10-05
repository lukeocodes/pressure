import { BaseEmailService } from '../service';
import type { EmailOptions, EmailResult } from '../../types';

/**
 * Console email provider for development
 * Logs emails to console instead of sending them
 */
export class ConsoleEmailService extends BaseEmailService {
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const to = this.normalizeRecipients(options.to);
    const cc = options.cc ? this.normalizeRecipients(options.cc) : [];
    const bcc = options.bcc ? this.normalizeRecipients(options.bcc) : [];
    
    console.log('\n=== EMAIL (CONSOLE MODE) ===');
    console.log('From:', this.getSender(options.from), `<${this.getSenderName(options.fromName)}>`);
    console.log('To:', to.join(', '));
    if (cc.length > 0) console.log('CC:', cc.join(', '));
    if (bcc.length > 0) console.log('BCC:', bcc.join(', '));
    console.log('Subject:', options.subject);
    console.log('\n--- TEXT ---');
    console.log(options.text);
    if (options.html) {
      console.log('\n--- HTML ---');
      console.log(options.html);
    }
    console.log('=== END EMAIL ===\n');
    
    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }
}

