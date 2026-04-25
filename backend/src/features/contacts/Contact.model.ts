// Contact.model.ts — Mongoose schema and model definition for the Contact entity; includes activity sub-schema.
import mongoose, { Schema } from 'mongoose';
import { IActivity, IContact, ContactStatus } from './contact.types';

const activitySchema = new Schema<IActivity>(
  {
    type: { type: String, required: true },
    desc: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    performedBy: { type: String, required: true },
    contactName: { type: String, required: true },
  },
  { _id: false }
);

const contactSchema = new Schema<IContact>(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: false, // Allows contacts to exist without an org (None/Personal)
    },
    name: { type: String, required: true, trim: true },
    co: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    email: { type: String, default: '-' },
    phone: { type: String, default: '-' },
    status: {
      type: String,
      enum: Object.values(ContactStatus),
      default: ContactStatus.Added,
    },
    addedBy: { type: String, required: true },
    addedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    notes: { type: String, default: '' },
    activity: [activitySchema],
  },
  { 
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        ret.date = new Date(ret.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
