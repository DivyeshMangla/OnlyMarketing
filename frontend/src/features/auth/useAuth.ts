// useAuth.ts — Custom hook for managing authentication state, profile data, and session persistence.
import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../../types';
import { authApi } from './auth.api';

/**
 * Hook for global authentication state management.
 * @returns Auth state and mutation methods
 */
export const useAuth = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /**
   * Clears local session and resets state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserProfile(null);
  }, []);

  /**
   * Fetches the current user profile from the API.
   */
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      logout();
      return;
    }
    try {
      const user = await authApi.me();
      setUserProfile(user);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, refreshUser]);

  // Background sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        refreshUser();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUser]);

  /**
   * Initializes a session with token and profile data.
   * @param token - JWT
   * @param user - User profile
   */
  const login = (token: string, user: UserProfile) => {
    localStorage.setItem('token', token);
    setUserProfile(user);
    setIsAuthenticated(true);
  };

  /**
   * Updates the user's profile and local state.
   * @param updates - Partial updates
   * @returns Updated profile
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await authApi.updateProfile(updates);
    setUserProfile(updated);
    return updated;
  };

  return {
    userProfile,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
    refreshUser
  };
};
