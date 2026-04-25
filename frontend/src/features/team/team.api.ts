import { apiClient } from '../../lib/apiClient';
import type { TeamMember, UserRole } from '../../types';

export const teamApi = {
  getAll: () => apiClient<TeamMember[]>('/team'),
  
  toggleAdmin: (id: string, role: UserRole) => apiClient<TeamMember>(`/team/${id}/role`, {
    method: 'PUT',
    data: { role },
  }),
  
  remove: (id: string) => apiClient<{ message: string }>(`/team/${id}`, {
    method: 'DELETE',
  }),
};
