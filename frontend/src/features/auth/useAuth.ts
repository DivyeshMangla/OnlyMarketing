// useAuth.ts — Custom hook for managing authentication state, profile data, and session persistence.
import { useEffect, useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../../types';
import { authApi } from './auth.api';
import { queryKeys } from '../../lib/queryKeys';
import { ApiError } from '../../lib/apiClient';

/**
 * Hook for global authentication state management.
 * @returns Auth state and mutation methods
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    const syncToken = () => {
      setAuthToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: Boolean(authToken),
    refetchInterval: 30000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.auth.me, updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all }),
      ]);
    },
  });

  /**
   * Clears local session and resets state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthToken(null);
    queryClient.removeQueries({ queryKey: queryKeys.auth.me });
    queryClient.removeQueries({ queryKey: queryKeys.organizations.all });
    queryClient.removeQueries({ queryKey: queryKeys.organizations.discover });
    queryClient.removeQueries({ queryKey: queryKeys.team.all });
    queryClient.removeQueries({ queryKey: ['contacts'] });
  }, [queryClient]);

  useEffect(() => {
    if (meQuery.error instanceof ApiError && [401, 403].includes(meQuery.error.status)) {
      logout();
    }
  }, [meQuery.error, logout]);

  /**
   * Fetches the current user profile from the API.
   */
  const refreshUser = useCallback(async () => {
    if (!authToken) {
      logout();
      return null;
    }
    const result = await meQuery.refetch();
    if (result.error) {
      throw result.error;
    }
    return result.data ?? null;
  }, [logout, meQuery]);

  /**
   * Initializes a session with token and profile data.
   * @param token - JWT
   * @param user - User profile
   */
  const login = (token: string, user: UserProfile) => {
    localStorage.setItem('token', token);
    queryClient.setQueryData(queryKeys.auth.me, user);
    setAuthToken(token);
  };

  /**
   * Updates the user's profile and local state.
   * @param updates - Partial updates
   * @returns Updated profile
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    return updateProfileMutation.mutateAsync(updates);
  };

  return {
    userProfile: meQuery.data ?? null,
    isAuthenticated: Boolean(authToken),
    loading: Boolean(authToken) && meQuery.isPending && !meQuery.data,
    login,
    logout,
    updateProfile,
    refreshUser
  };
};
