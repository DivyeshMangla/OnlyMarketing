// userUtils.ts — Utility functions for processing user profile data for the UI.

/**
 * Extracts initials from a full name (e.g., "John Doe" -> "JD").
 * @param name - Full name of the user
 * @returns Initials string
 */
export const getInitials = (name?: string): string => {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase() || 'U';
};
