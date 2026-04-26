// index.ts — Global TypeScript definitions; contains interfaces for all core entities (Contacts, Orgs, Users).
export type Page = 'dashboard' | 'analytics' | 'team' | 'organizations' | 'apollo';
export type ContactStatus = 'Added' | 'In The Works' | 'Denied';
export type UserPosition = 'Executive' | 'Core' | 'Coordinator' | 'Executive Board';
export type UserRole = 'Admin' | 'User';

export interface Activity {
  type: string;
  desc: string;
  date: string;
  performedBy: string;
  contactName: string;
}

export interface Contact {
  id: string;
  orgId: string;
  name: string;
  co: string;
  position: string;
  email: string;
  phone: string;
  status: ContactStatus;
  date: string;
  mine: boolean;
  addedBy: string;
  addedById?: string;
  notes: string;
  activity: Activity[];
}

export interface TeamMember {
  id: string;
  name: string;
  position: UserPosition;
  email: string;
  phone: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  name: string;
  position: UserPosition;
  phone: string;
  email: string;
  birth: string;
  role: UserRole;
}

export type OrgRole = 'Owner' | 'Admin' | 'Member';
export type MemberStatus = 'Pending' | 'Approved';

export interface OrgMember {
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  role: OrgRole;
  status: MemberStatus;
}

export interface Organization {
  id: string;
  name: string;
  proposalFileName: string;
  proposalData: string;
  emailTemplate: string;
  whatsappTemplate: string;
  instaTemplate: string;
  members: OrgMember[];
}

export interface CreateContactPayload {
  orgId: string;
  name: string;
  co: string;
  position: string;
  email?: string;
  phone?: string;
}

export interface MessagePreviewState {
  type: string;
  template: string;
}

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

