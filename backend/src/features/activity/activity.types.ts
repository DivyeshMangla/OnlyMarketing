// activity.types.ts — Shared activity log types.
import { Document, Types } from 'mongoose';

export interface IActivityRecord extends Document {
  _id: Types.ObjectId;
  type: string;
  desc: string;
  date: Date;
  performedBy: string;
  performedById?: Types.ObjectId;
  contactName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityRecordBody {
  type: string;
  desc: string;
  date?: Date;
  performedBy: string;
  performedById?: string | Types.ObjectId;
  contactName: string;
}

export interface ActivityRecordDto {
  id: string;
  type: string;
  desc: string;
  date: string;
  performedBy: string;
  performedById?: string;
  contactName: string;
}
