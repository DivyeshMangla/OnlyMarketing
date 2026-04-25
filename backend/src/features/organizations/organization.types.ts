// organization.types.ts — TypeScript interfaces for organization documents and requests.
import { Document, Types } from 'mongoose';

export type OrgRole = 'Owner' | 'Admin' | 'Member';
export type MemberStatus = 'Pending' | 'Approved';

export interface IOrgMember {
  userId: any; // Can be ObjectId or populated User object
  role: OrgRole;
  status: MemberStatus;
}

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  id: string; // Added for type safety after toJSON transform
  name: string;
  proposalFileName: string;
  proposalData: string;
  emailTemplate: string;
  whatsappTemplate: string;
  instaTemplate: string;
  members: IOrgMember[];
  createdAt: Date;
  updatedAt: Date;
}

/** Request body for POST /api/orgs */
export interface CreateOrgBody {
  name: string;
}

/** Request body for PUT /api/orgs/:id */
export interface UpdateOrgBody {
  proposalFileName?: string;
  proposalData?: string;
  emailTemplate?: string;
  whatsappTemplate?: string;
  instaTemplate?: string;
}
