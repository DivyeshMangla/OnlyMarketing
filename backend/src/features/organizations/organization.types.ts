// organization.types.ts — TypeScript interfaces for organization documents and requests.
import { Document, Types } from 'mongoose';

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  proposalFileName: string;
  proposalData: string;
  emailTemplate: string;
  whatsappTemplate: string;
  instaTemplate: string;
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
