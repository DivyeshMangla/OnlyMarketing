// useAuth.ts — Custom hook for managing authentication state, profile data, and session persistence.
import { useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../../types';
import { authApi } from './auth.api';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Hook for global authentication state management.
 * @returns Auth state and mutation methods
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: Boolean(token),
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
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    if (meQuery.error) {
      logout();
    }
  }, [meQuery.error, logout]);

  /**
   * Fetches the current user profile from the API.
   */
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
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
    queryClient.clear();
    localStorage.setItem('token', token);
    queryClient.setQueryData(queryKeys.auth.me, user);
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
    isAuthenticated: Boolean(token),
    loading: Boolean(token) && meQuery.isPending,
    login,
    logout,
    updateProfile,
    refreshUser
  };
};
