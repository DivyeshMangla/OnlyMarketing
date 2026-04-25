// contactUtils.ts — Pure utility functions for filtering, searching, and aggregating contact data.
import type { Contact } from '../types';

/**
 * Calculates summary statistics for a given list of contacts.
 * @param contacts - Array of contacts
 * @returns Object with total, in-progress, and denied counts
 */
export const getContactStats = (contacts: Contact[]) => {
  return {
    total: contacts.length,
    inTheWorks: contacts.filter(c => c.status === 'In The Works').length,
    denied: contacts.filter(c => c.status === 'Denied').length,
  };
};

/**
 * Filters a list of contacts to only include those assigned to the current user.
 * @param contacts - Array of contacts
 * @returns Filtered array
 */
export const filterMyContacts = (contacts: Contact[]) => {
  return contacts.filter(c => c.mine);
};

/**
 * Aggregates activity logs for a specific team member across all contacts.
 * @param contacts - Array of contacts
 * @param name - Name of the team member
 * @returns Flat array of activity items
 */
export const getMemberActivities = (contacts: Contact[], name: string) => {
  return contacts.flatMap(c => c.activity).filter(a => a.performedBy === name);
};

/**
 * Performs a case-insensitive search across contact name, company, and email.
 * @param contacts - Array of contacts
 * @param query - Search string
 * @returns Filtered array
 */
export const searchContacts = (contacts: Contact[], query: string) => {
  if (!query) return contacts;
  const q = query.toLowerCase();
  return contacts.filter(
    c => 
      c.name.toLowerCase().includes(q) || 
      c.co.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q)
  );
};
