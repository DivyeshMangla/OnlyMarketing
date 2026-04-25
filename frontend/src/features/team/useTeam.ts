// useTeam.ts — Custom hook for managing team members; handles role promotions and member removal.
import { useState, useCallback } from 'react';
import type { TeamMember, UserRole } from '../../types';
import { teamApi } from './team.api';

/**
 * Hook for managing the team members state and admin operations.
 * @returns Team state and mutation methods
 */
export const useTeam = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches all team members from the API.
   */
  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teamApi.getAll();
      setTeam(data);
    } catch (err) {
      console.error('Failed to fetch team', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Toggles a user's role between Admin and User.
   * @param id - User ID
   * @param currentRole - Current role string
   * @returns Updated team member
   */
  const toggleAdmin = async (id: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === 'Admin' ? 'User' : 'Admin';
    const updated = await teamApi.toggleAdmin(id, newRole);
    setTeam(prev => prev.map(m => m.id === id ? updated : m));
    return updated;
  };

  /**
   * Permanently removes a team member.
   * @param id - User ID
   */
  const removeMember = async (id: string) => {
    await teamApi.remove(id);
    setTeam(prev => prev.filter(m => m.id !== id));
  };

  return {
    team,
    loading,
    fetchTeam,
    toggleAdmin,
    removeMember
  };
};
