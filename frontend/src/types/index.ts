// index.ts — Global TypeScript definitions; contains interfaces for all core entities (Contacts, Orgs, Users).
export type Page = 'dashboard' | 'analytics' | 'team' | 'organizations';
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
  name: string;
  position: UserPosition;
  phone: string;
  email: string;
  birth: string;
  role: UserRole;
}

export interface Organization {
  id: string;
  name: string;
  proposalFileName: string;
  proposalData: string;
  emailTemplate: string;
  whatsappTemplate: string;
  instaTemplate: string;
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

