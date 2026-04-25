// Organization.model.ts — Mongoose schema and model definition for the Organization entity.
import mongoose, { Schema } from 'mongoose';
import { IOrganization, OrgRole, MemberStatus } from './organization.types';

const memberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { 
      type: String, 
      enum: ['Owner', 'Admin', 'Member'], 
      default: 'Member' 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Approved'], 
      default: 'Pending' 
    },
  },
  { _id: false }
);

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, unique: true, minlength: 2, trim: true },
    proposalFileName: { type: String, default: '' },
    proposalData: { type: String, default: '' },
    emailTemplate: { type: String, default: '' },
    whatsappTemplate: { type: String, default: '' },
    instaTemplate: { type: String, default: '' },
    members: [memberSchema],
  },
  { 
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

export const Organization = mongoose.model<IOrganization>(
  'Organization',
  organizationSchema
);
