export interface Campaign {
  title: string;
  description: string;
  slug: string;
  emailSubject: string;
  emailTemplate: string;
  userEmailSubject: string;
  userEmailTemplate: string;
  thankYouMessage: string;
  cc: string[];
  bcc: string[];
  styling: {
    primaryColor: string;
    logoUrl: string;
  };
  footer: {
    organizationName: string;
    organizationUrl: string;
  };
}

export interface MP {
  name: string;
  constituency: string;
  party: string;
  email: string;
}

export interface UserDetails {
  name: string;
  email: string;
  postcode: string;
  address: string;
}

export interface MagicLinkPayload {
  email: string;
  name: string;
  postcode: string;
  address: string;
  mpEmail: string;
  mpName: string;
  constituency: string;
  party: string;
  exp: number;
  iat: number;
}

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  fromName?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

