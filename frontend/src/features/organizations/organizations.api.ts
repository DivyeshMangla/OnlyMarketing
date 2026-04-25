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

  discover: () => apiClient<Partial<Organization>[]>('/orgs/discover'),

  requestJoin: (id: string) => apiClient<void>(`/orgs/${id}/request`, {
    method: 'POST',
  }),

  updateMember: (orgId: string, userId: string, data: { status?: MemberStatus; role?: OrgRole }) => 
    apiClient<Organization>(`/orgs/${orgId}/members/${userId}`, {
      method: 'PUT',
      data,
    }),

  removeMember: (orgId: string, userId: string) => 
    apiClient<Organization>(`/orgs/${orgId}/members/${userId}`, {
      method: 'DELETE',
    }),
};
