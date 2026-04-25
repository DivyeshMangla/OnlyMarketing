// useContacts.ts — Custom hook for managing contact data; handles fetching, adding, updating, and removing contacts.
import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Contact, CreateContactPayload, ContactStatus } from '../../types';
import { contactsApi } from './contacts.api';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Hook for managing contacts scoped to an organization.
 * @param activeOrgId - Current organization ID or 'none' for unassigned
 * @returns Contact state and mutation methods
 */
export const useContacts = (activeOrgId: string | null) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const contactsQuery = useQuery({
    queryKey: queryKeys.contacts.list(activeOrgId ?? 'unselected'),
    queryFn: () => contactsApi.getByOrg(activeOrgId!),
    enabled: Boolean(token && activeOrgId),
  });

  const addContactMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: async (newContact, payload) => {
      queryClient.setQueryData<Contact[]>(queryKeys.contacts.list(payload.orgId), (prev = []) => [newContact, ...prev]);
      queryClient.setQueryData(queryKeys.contacts.detail(newContact.id), newContact);
      await queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(payload.orgId) });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status?: ContactStatus; notes?: string; newActivity?: { type: string; desc: string } } }) =>
      contactsApi.update(id, updates),
    onSuccess: async (updated) => {
      if (activeOrgId) {
        queryClient.setQueryData<Contact[]>(queryKeys.contacts.list(activeOrgId), (prev = []) =>
          prev.map((contact) => (contact.id === updated.id ? updated : contact))
        );
        await queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(activeOrgId) });
      }
      queryClient.setQueryData(queryKeys.contacts.detail(updated.id), updated);
    },
  });

  const removeContactMutation = useMutation({
    mutationFn: contactsApi.remove,
    onSuccess: async (_, id) => {
      if (activeOrgId) {
        queryClient.setQueryData<Contact[]>(queryKeys.contacts.list(activeOrgId), (prev = []) =>
          prev.filter((contact) => contact.id !== id)
        );
        await queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(activeOrgId) });
      }
      queryClient.removeQueries({ queryKey: queryKeys.contacts.detail(id) });
    },
  });

  /**
   * Fetches contacts for the active organization.
   */
  const fetchContacts = useCallback(async () => {
    if (!activeOrgId) {
      return [];
    }
    const result = await contactsQuery.refetch();
    return result.data ?? [];
  }, [activeOrgId, contactsQuery]);

  /**
   * Adds a new contact to the database and local state.
   * @param payload - Contact details
   * @returns Newly created contact
   */
  const addContact = async (payload: CreateContactPayload) => {
    return addContactMutation.mutateAsync(payload);
  };

  /**
   * Updates a contact's status, notes, or adds a new activity.
   * @param id - Contact ID
   * @param updates - Partial updates and optional new activity
   * @returns Updated contact
   */
  const updateContact = async (id: string, updates: { status?: ContactStatus; notes?: string; newActivity?: { type: string; desc: string } }) => {
    return updateContactMutation.mutateAsync({ id, updates });
  };

  /**
   * Permanently removes a contact.
   * @param id - Contact ID
   */
  const removeContact = async (id: string) => {
    await removeContactMutation.mutateAsync(id);
  };

  const fetchContactDetails = useCallback(async (id: string) => {
    const fullContact = await queryClient.fetchQuery({
      queryKey: queryKeys.contacts.detail(id),
      queryFn: () => contactsApi.getById(id),
    });
    if (activeOrgId) {
      queryClient.setQueryData<Contact[]>(queryKeys.contacts.list(activeOrgId), (prev = []) =>
        prev.map((contact) => (contact.id === id ? fullContact : contact))
      );
    }
    return fullContact;
  }, [activeOrgId, queryClient]);

  return {
    contacts: contactsQuery.data ?? [],
    loading: contactsQuery.isPending || addContactMutation.isPending || updateContactMutation.isPending || removeContactMutation.isPending,
    fetchContacts,
    addContact,
    updateContact,
    removeContact,
    fetchContactDetails
  };
};
