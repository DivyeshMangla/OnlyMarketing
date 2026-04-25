// useTeam.ts — Custom hook for managing team members; handles role promotions and member removal.
import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TeamMember, UserRole } from '../../types';
import { teamApi } from './team.api';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Hook for managing the team members state and admin operations.
 * @returns Team state and mutation methods
 */
export const useTeam = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const teamQuery = useQuery({
    queryKey: queryKeys.team.all,
    queryFn: teamApi.getAll,
    enabled: Boolean(token),
  });

  const toggleAdminMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => teamApi.toggleAdmin(id, role),
    onSuccess: async (updated) => {
      queryClient.setQueryData<TeamMember[]>(queryKeys.team.all, (prev = []) =>
        prev.map((member) => (member.id === updated.id ? updated : member))
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all }),
      ]);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: teamApi.remove,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<TeamMember[]>(queryKeys.team.all, (prev = []) =>
        prev.filter((member) => member.id !== id)
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all }),
      ]);
    },
  });

  /**
   * Fetches all team members from the API.
   */
  const fetchTeam = useCallback(async () => {
    const result = await teamQuery.refetch();
    return result.data ?? [];
  }, [teamQuery]);

  /**
   * Toggles a user's role between Admin and User.
   * @param id - User ID
   * @param currentRole - Current role string
   * @returns Updated team member
   */
  const toggleAdmin = async (id: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === 'Admin' ? 'User' : 'Admin';
    return toggleAdminMutation.mutateAsync({ id, role: newRole });
  };

  /**
   * Permanently removes a team member.
   * @param id - User ID
   */
  const removeMember = async (id: string) => {
    await removeMemberMutation.mutateAsync(id);
  };

  return {
    team: teamQuery.data ?? [],
    loading: teamQuery.isPending || toggleAdminMutation.isPending || removeMemberMutation.isPending,
    fetchTeam,
    toggleAdmin,
    removeMember
  };
};
