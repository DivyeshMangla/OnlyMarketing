import { apiClient } from '../../lib/apiClient';
import type { ApolloCompanySearchResponse, ApolloContactSearchResponse } from '../../types';

export const apolloApi = {
  searchCompanies: (query: string) =>
    apiClient<ApolloCompanySearchResponse>(`/apollo/companies?query=${encodeURIComponent(query)}`),

  searchContacts: (params: { organizationId: string; domain: string }) => {
    const searchParams = new URLSearchParams();
    if (params.organizationId) searchParams.set('organizationId', params.organizationId);
    if (params.domain) searchParams.set('domain', params.domain);
    return apiClient<ApolloContactSearchResponse>(`/apollo/contacts?${searchParams.toString()}`);
  },
};
