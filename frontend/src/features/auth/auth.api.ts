import { apiClient } from '../../lib/apiClient';
import type { UserProfile } from '../../types';

export const authApi = {
  me: () => apiClient<UserProfile>('/auth/me'),
  
  login: (data: any) => apiClient<{ token: string; user: UserProfile }>('/auth/login', {
    method: 'POST',
    data,
  }),
  
  register: (data: any) => apiClient<{ token: string; user: UserProfile }>('/auth/register', {
    method: 'POST',
    data,
  }),
  
  updateProfile: (data: Partial<UserProfile>) => apiClient<UserProfile>('/auth/me', {
    method: 'PUT',
    data,
  }),
};
