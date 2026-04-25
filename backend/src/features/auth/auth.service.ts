// auth.service.ts — Data access layer for all user-related MongoDB queries.
import { Types } from 'mongoose';
import { User } from './User.model';
import { IUser, RegisterBody, UpdateProfileBody, UserRole } from './auth.types';

/**
 * Returns a user document including the password hash for authentication.
 * @param email - User's email address
 * @returns User document with password or null
 */
export async function findUserByEmailWithPassword(
  email: string
): Promise<(IUser & { comparePassword: (p: string) => Promise<boolean> }) | null> {
  return User.findOne({ email }).select('+password') as Promise<
    (IUser & { comparePassword: (p: string) => Promise<boolean> }) | null
  >;
}

/**
 * Returns a user document without sensitive fields by email.
 * @param email - User's email address
 * @returns Safe user document or null
 */
export async function findUserByEmail(
  email: string
): Promise<IUser | null> {
  return User.findOne({ email }).select('-password');
}

/**
 * Returns a user document without sensitive fields by ID.
 * @param id - User's MongoDB ID
 * @returns Safe user document or null
 */
export async function findUserById(
  id: string | Types.ObjectId
): Promise<IUser | null> {
  return User.findById(id).select('-password');
}

/**
 * Counts the total number of users in the system.
 * @returns Number of user documents
 */
export async function countUsers(): Promise<number> {
  return User.countDocuments();
}

/**
 * Creates and persists a new user with a specific role.
 * @param data - Registration details
 * @param role - System role (Admin/User)
 * @returns Newly created user document
 */
export async function createUser(
  data: RegisterBody,
  role: UserRole
): Promise<IUser> {
  const user = new User({ ...data, role });
  await user.save();
  const saved = await findUserById(user._id);
  if (!saved) throw new Error('Failed to retrieve user after creation');
  return saved;
}

/**
 * Updates a user's profile information.
 * @param id - User's MongoDB ID
 * @param updates - Partial profile updates
 * @returns Updated safe user document or null
 */
export async function updateUserById(
  id: string | Types.ObjectId,
  updates: UpdateProfileBody
): Promise<IUser | null> {
  return User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');
}
