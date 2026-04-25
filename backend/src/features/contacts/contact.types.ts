// contact.types.ts — TypeScript interfaces and enums for contact management.
import { Document, Types } from 'mongoose';

export interface IActivity {
  type: string;
  desc: string;
  date: Date;
  performedBy: string;
  contactName: string;
}

/**
 * Enum-style const for contact status — mirrors the schema enum.
 */
export const ContactStatus = {
  Added: 'Added',
  InTheWorks: 'In The Works',
  Denied: 'Denied',
} as const;
export type ContactStatus = (typeof ContactStatus)[keyof typeof ContactStatus];

export interface IContact extends Document {
  _id: Types.ObjectId;
  orgId?: Types.ObjectId;
  name: string;
  co: string;
  position: string;
  email: string;
  phone: string;
  status: ContactStatus;
  addedBy: string;
  addedById?: Types.ObjectId;
  notes: string;
  activity: IActivity[];
  createdAt: Date;
  updatedAt: Date;
}

/** Request body for POST /api/contacts */
export interface CreateContactBody {
  orgId: string;
  name: string;
  co: string;
  position: string;
  email?: string;
  phone?: string;
}

/** Request body for PUT /api/contacts/:id */
export interface UpdateContactBody {
  status?: ContactStatus;
  notes?: string;
  newActivity?: {
    type: string;
    desc: string;
  };
}
