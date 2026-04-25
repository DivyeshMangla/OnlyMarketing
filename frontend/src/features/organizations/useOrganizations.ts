// useOrganizations.ts — Custom hook for managing the list of organizations and their specific settings.
import { useState, useCallback } from 'react';
import type { Organization } from '../../types';
import { organizationsApi } from './organizations.api';

/**
 * Hook for managing the organizations state and CRUD operations.
 * @returns Organization state and mutation methods
 */
export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches all organizations from the API.
   * @returns Array of organizations
   */
  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizationsApi.getAll();
      setOrganizations(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch organizations', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Creates a new organization.
   * @param name - Organization name
   * @returns Newly created organization
   */
  const addOrg = async (name: string) => {
    const newOrg = await organizationsApi.create(name);
    setOrganizations(prev => [...prev, newOrg]);
    return newOrg;
  };

  /**
   * Updates an existing organization's settings.
   * @param id - Organization ID
   * @param updates - Partial updates
   * @returns Updated organization
   */
  const updateOrg = async (id: string, updates: Partial<Organization>) => {
    const updated = await organizationsApi.update(id, updates);
    setOrganizations(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  };

  const discoverOrgs = async () => {
    return await organizationsApi.discover();
  };

  const joinRequest = async (id: string) => {
    await organizationsApi.requestJoin(id);
  };

  const updateMember = async (orgId: string, userId: string, status?: MemberStatus, role?: OrgRole) => {
    const updated = await organizationsApi.updateMember(orgId, userId, { status, role });
    setOrganizations(prev => prev.map(o => o.id === orgId ? updated : o));
    return updated;
  };

  const removeMember = async (orgId: string, userId: string) => {
    const updated = await organizationsApi.removeMember(orgId, userId);
    setOrganizations(prev => prev.map(o => o.id === orgId ? updated : o));
    return updated;
  };

  return {
    organizations,
    loading,
    fetchOrganizations,
    addOrg,
    updateOrg,
    discoverOrgs,
    joinRequest,
    updateMember,
    removeMember
  };
};
