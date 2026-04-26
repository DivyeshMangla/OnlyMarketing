// useApolloSearch.ts — Custom hook for admin-only Apollo company and contact searches.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApolloCompanySearchResponse, ApolloContactSearchResponse } from '../../types';
import { apolloApi } from './apollo.api';
import { queryKeys } from '../../lib/queryKeys';

export const useApolloSearch = () => {
  const queryClient = useQueryClient();

  const companySearchMutation = useMutation<ApolloCompanySearchResponse, Error, string>({
    mutationFn: apolloApi.searchCompanies,
  });

  const contactSearchMutation = useMutation<
    ApolloContactSearchResponse,
    Error,
    { organizationId: string; domain: string; companyName: string }
  >({
    mutationFn: apolloApi.searchContacts,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });

  return {
    companies: companySearchMutation.data?.companies ?? [],
    contacts: contactSearchMutation.data?.contacts ?? [],
    searchCompanies: companySearchMutation.mutateAsync,
    fetchContacts: contactSearchMutation.mutateAsync,
    resetCompanies: companySearchMutation.reset,
    resetContacts: contactSearchMutation.reset,
    companyLoading: companySearchMutation.isPending,
    contactsLoading: contactSearchMutation.isPending,
    companyError: companySearchMutation.error?.message ?? '',
    contactsError: contactSearchMutation.error?.message ?? '',
  };
};
