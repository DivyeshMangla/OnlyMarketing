// User.model.ts — Mongoose schema and model definition for the User entity.
import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserMethods, UserPosition, UserRole } from './auth.types';


type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    position: {
      type: String,
      enum: Object.values(UserPosition),
      default: UserPosition.Executive,
    },
    phone: { type: String, default: '' },
    birth: { type: String, default: '' },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
    },
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

// Hash password only when it has been modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method: compare a candidate password against the stored hash
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
