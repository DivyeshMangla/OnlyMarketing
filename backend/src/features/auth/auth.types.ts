// auth.types.ts — TypeScript interfaces and enums for the authentication domain.
import { Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * Enum-style const for user positions — mirrors the schema enum.
 * Use these values everywhere instead of raw strings.
 */
export const UserPosition = {
  Executive: 'Executive',
  Core: 'Core',
  Coordinator: 'Coordinator',
  ExecutiveBoard: 'Executive Board',
} as const;
export type UserPosition = (typeof UserPosition)[keyof typeof UserPosition];

/**
 * Enum-style const for user roles — mirrors the schema enum.
 */
export const UserRole = {
  Admin: 'Admin',
  User: 'User',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ─── Document Interfaces ──────────────────────────────────────────────────────

/**
 * The shape of a User document stored in MongoDB.
 * IUserMethods carries the instance methods added to the schema.
 */
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  position: UserPosition;
  phone: string;
  birth: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe public projection of a user — never includes `password`. */
export type PublicUser = Omit<IUser, 'password'>;

// ─── Request/Response Shapes ──────────────────────────────────────────────────

/** Request body for POST /auth/register */
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  position?: UserPosition;
  phone?: string;
  birth?: string;
}

/** Request body for POST /auth/login */
export interface LoginBody {
  email: string;
  password: string;
}

/** Request body for PUT /auth/me */
export interface UpdateProfileBody {
  name?: string;
  position?: UserPosition;
  phone?: string;
  birth?: string;
  email?: string;
}

/** Shape returned to the client after login / register */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    position: UserPosition;
    phone: string;
    birth: string;
  };
}
