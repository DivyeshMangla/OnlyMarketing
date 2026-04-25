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
        // Ensure id is a string
        if (ret._id) ret.id = ret._id.toString();
        
        if (Array.isArray(ret.members)) {
          ret.members = ret.members.map((m: any) => {
            const memberObj = { ...m };
            
            // Check if userId is populated (is an object with name property)
            const isPopulated = m.userId && typeof m.userId === 'object' && 'name' in m.userId;
            
            if (isPopulated) {
              memberObj.user = { 
                name: m.userId.name, 
                email: m.userId.email 
              };
              memberObj.userId = m.userId._id ? m.userId._id.toString() : m.userId.toString();
            } else if (m.userId) {
              // Ensure raw userId is a string
              memberObj.userId = m.userId.toString();
            }
            
            return memberObj;
          });
        }

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
