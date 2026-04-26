// Activity.model.ts — Mongoose schema and model for shared activity records.
import mongoose, { Schema } from 'mongoose';
import { IActivityRecord } from './activity.types';

const activityRecordSchema = new Schema<IActivityRecord>(
  {
    type: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    performedBy: { type: String, required: true, trim: true },
    performedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    contactName: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const ActivityRecord = mongoose.model<IActivityRecord>('ActivityRecord', activityRecordSchema);
