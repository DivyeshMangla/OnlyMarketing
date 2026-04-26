// apollo.types.ts — TypeScript shapes for normalized Apollo search results.

export interface ApolloCompany {
  id: string;
  name: string;
  domain: string;
  logoUrl: string;
  websiteUrl: string;
  industry: string;
  location: string;
  employeeCount?: number;
  size: string;
}

export interface ApolloContact {
  id: string;
  name: string;
  title: string;
  seniority: string;
  location: string;
  organizationName: string;
  linkedinUrl: string;
  photoUrl: string;
  hasEmail: boolean;
  hasPhone: boolean;
  apolloUrl: string;
}

export interface ApolloCompanySearchResponse {
  companies: ApolloCompany[];
}

export interface ApolloContactSearchResponse {
  contacts: ApolloContact[];
}
