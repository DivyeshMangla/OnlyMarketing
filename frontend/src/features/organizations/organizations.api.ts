import { apiClient } from '../../lib/apiClient';
import type { Organization } from '../../types';

export const organizationsApi = {
  getAll: () => apiClient<Organization[]>('/orgs'),
  
  create: (name: string) => apiClient<Organization>('/orgs', {
    method: 'POST',
    data: { name },
  }),
  
  update: (id: string, data: Partial<Organization>) => apiClient<Organization>(`/orgs/${id}`, {
    method: 'PUT',
    data,
  }),
};
