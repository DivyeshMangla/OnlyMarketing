import { apiClient } from '../../lib/apiClient';
import type { Contact, CreateContactPayload, ContactStatus } from '../../types';

export const contactsApi = {
  getByOrg: (orgId: string) => apiClient<Contact[]>(`/contacts/${orgId}`),
  getById: (id: string) => apiClient<Contact>(`/contacts/details/${id}`),
  
  create: (data: CreateContactPayload) => apiClient<Contact>('/contacts', {
    method: 'POST',
    data,
  }),
  
  update: (id: string, data: { status?: ContactStatus; notes?: string; newActivity?: { type: string; desc: string } }) => apiClient<Contact>(`/contacts/${id}`, {
    method: 'PUT',
    data,
  }),
  
  remove: (id: string) => apiClient<{ message: string }>(`/contacts/${id}`, {
    method: 'DELETE',
  }),
};
