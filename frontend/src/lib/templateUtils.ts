// templateUtils.ts — Utility for parsing and filling placeholders in outreach message templates.
import type { Contact, UserProfile, Organization } from '../types';

/**
 * Replaces double-curly placeholders (e.g., {{poc_name}}) with real data.
 * @param template - The raw template string
 * @param data - Object containing contact, user, and organization context
 * @returns Processed string with all placeholders filled
 */
export const fillPlaceholders = (template: string, data: { contact: Contact, user: UserProfile, org: Organization }) => {
  if (!template) return "";
  return template
    .replace(/{{poc_name}}/g, data.contact.name)
    .replace(/{{company_name}}/g, data.contact.co)
    .replace(/{{fest_name}}/g, data.org.name)
    .replace(/{{user_name}}/g, data.user.name)
    .replace(/{{user_position}}/g, data.user.position)
    .replace(/{{user_phone}}/g, data.user.phone);
};
