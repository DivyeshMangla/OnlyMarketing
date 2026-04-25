// useOrganizations.ts — Custom hook for managing the list of organizations and their specific settings.
import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Organization, MemberStatus, OrgRole } from '../../types';
import { organizationsApi } from './organizations.api';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Hook for managing the organizations state and CRUD operations.
 * @returns Organization state and mutation methods
 */
export const useOrganizations = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const organizationsQuery = useQuery({
    queryKey: queryKeys.organizations.all,
    queryFn: organizationsApi.getAll,
    enabled: Boolean(token),
  });

  const addOrgMutation = useMutation({
    mutationFn: organizationsApi.create,
    onSuccess: async (newOrg) => {
      queryClient.setQueryData<Organization[]>(queryKeys.organizations.all, (prev = []) => [...prev, newOrg]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.discover }),
      ]);
    },
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Organization> }) => organizationsApi.update(id, updates),
    onSuccess: async (updated) => {
      queryClient.setQueryData<Organization[]>(queryKeys.organizations.all, (prev = []) =>
        prev.map((org) => (org.id === updated.id ? updated : org))
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });

  const joinRequestMutation = useMutation({
    mutationFn: organizationsApi.requestJoin,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.discover }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all }),
      ]);
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ orgId, userId, data }: { orgId: string; userId: string; data: { status?: MemberStatus; role?: OrgRole } }) =>
      organizationsApi.updateMember(orgId, userId, data),
    onSuccess: async (updated) => {
      queryClient.setQueryData<Organization[]>(queryKeys.organizations.all, (prev = []) =>
        prev.map((org) => (org.id === updated.id ? updated : org))
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) => organizationsApi.removeMember(orgId, userId),
    onSuccess: async (updated) => {
      queryClient.setQueryData<Organization[]>(queryKeys.organizations.all, (prev = []) =>
        prev.map((org) => (org.id === updated.id ? updated : org))
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });

  const removeOrgMutation = useMutation({
    mutationFn: organizationsApi.remove,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<Organization[]>(queryKeys.organizations.all, (prev = []) =>
        prev.filter((org) => org.id !== id)
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations.discover }),
      ]);
    },
  });

  /**
   * Fetches all organizations from the API.
   * @returns Array of organizations
   */
  const fetchOrganizations = useCallback(async () => {
    const result = await organizationsQuery.refetch();
    return result.data ?? [];
  }, [organizationsQuery]);

  /**
   * Creates a new organization.
   * @param name - Organization name
   * @returns Newly created organization
   */
  const addOrg = async (name: string) => {
    return addOrgMutation.mutateAsync(name);
  };

  /**
   * Updates an existing organization's settings.
   * @param id - Organization ID
   * @param updates - Partial updates
   * @returns Updated organization
   */
  const updateOrg = async (id: string, updates: Partial<Organization>) => {
    return updateOrgMutation.mutateAsync({ id, updates });
  };

  const discoverOrgs = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.organizations.discover,
      queryFn: organizationsApi.discover,
    });
  }, [queryClient]);

  const joinRequest = async (id: string) => {
    return joinRequestMutation.mutateAsync(id);
  };

  const updateMember = async (orgId: string, userId: string, status?: MemberStatus, role?: OrgRole) => {
    return updateMemberMutation.mutateAsync({ orgId, userId, data: { status, role } });
  };

  const removeMember = async (orgId: string, userId: string) => {
    return removeMemberMutation.mutateAsync({ orgId, userId });
  };

  const removeOrg = async (id: string) => {
    await removeOrgMutation.mutateAsync(id);
  };

  return {
    organizations: organizationsQuery.data ?? [],
    loading:
      organizationsQuery.isPending ||
      addOrgMutation.isPending ||
      updateOrgMutation.isPending ||
      joinRequestMutation.isPending ||
      updateMemberMutation.isPending ||
      removeMemberMutation.isPending ||
      removeOrgMutation.isPending,
    initialized: organizationsQuery.isFetched,
    fetchOrganizations,
    addOrg,
    updateOrg,
    discoverOrgs,
    joinRequest,
    updateMember,
    removeMember,
    removeOrg
  };
};
