// useContacts.ts — Custom hook for managing contact data; handles fetching, adding, updating, and removing contacts.
import { useState, useCallback } from 'react';
import type { Contact, CreateContactPayload, ContactStatus } from '../../types';
import { contactsApi } from './contacts.api';

/**
 * Hook for managing contacts scoped to an organization.
 * @param activeOrgId - Current organization ID or 'none' for unassigned
 * @returns Contact state and mutation methods
 */
export const useContacts = (activeOrgId: string | null) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches contacts for the active organization.
   */
  const fetchContacts = useCallback(async () => {
    if (!activeOrgId) {
      setContacts([]);
      return;
    }
    setLoading(true);
    try {
      const data = await contactsApi.getByOrg(activeOrgId);
      setContacts(data);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  }, [activeOrgId]);

  /**
   * Adds a new contact to the database and local state.
   * @param payload - Contact details
   * @returns Newly created contact
   */
  const addContact = async (payload: CreateContactPayload) => {
    const newContact = await contactsApi.create(payload);
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  };

  /**
   * Updates a contact's status or notes.
   * @param id - Contact ID
   * @param updates - Partial updates
   * @returns Updated contact
   */
  const updateContact = async (id: string, updates: { status?: ContactStatus; notes?: string }) => {
    const updated = await contactsApi.update(id, updates);
    setContacts(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  /**
   * Permanently removes a contact.
   * @param id - Contact ID
   */
  const removeContact = async (id: string) => {
    await contactsApi.remove(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const fetchContactDetails = async (id: string) => {
    const fullContact = await contactsApi.getById(id);
    // Update local state with the full document so we don't have to fetch again
    setContacts(prev => prev.map(c => c.id === id ? fullContact : c));
    return fullContact;
  };

  return {
    contacts,
    loading,
    fetchContacts,
    addContact,
    updateContact,
    removeContact,
    fetchContactDetails
  };
};
