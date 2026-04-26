import { apiClient } from '../../lib/apiClient';
import type { ApolloCompanySearchResponse, ApolloContactSearchResponse } from '../../types';

export const apolloApi = {
  searchCompanies: (query: string) =>
    apiClient<ApolloCompanySearchResponse>(`/apollo/companies?query=${encodeURIComponent(query)}`),

  searchContacts: (params: { organizationId: string; domain: string; companyName: string }) => {
    const searchParams = new URLSearchParams();
    if (params.organizationId) searchParams.set('organizationId', params.organizationId);
    if (params.domain) searchParams.set('domain', params.domain);
    if (params.companyName) searchParams.set('companyName', params.companyName);
    return apiClient<ApolloContactSearchResponse>(`/apollo/contacts?${searchParams.toString()}`);
  },
};
