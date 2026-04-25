// team.service.ts — Data access layer for team member management; interacts with the User model.
import { Types } from 'mongoose';
import { User } from '../auth/User.model';
import { IUser, UserRole } from '../auth/auth.types';

/**
 * Retrieves all users from the database, excluding passwords.
 * @returns Array of user documents
 */
export async function getAllTeamMembers(): Promise<IUser[]> {
  return User.find().select('-password').sort({ createdAt: 1 });
}

/**
 * Updates a user's system role.
 * @param id - User's MongoDB ID
 * @param role - New role (Admin/User)
 * @returns Updated user document or null
 */
export async function updateUserRole(
  id: string | Types.ObjectId,
  role: UserRole
): Promise<IUser | null> {
  return User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');
}

/**
 * Permanently deletes a user from the database.
 * @param id - User's MongoDB ID
 * @returns True if deleted, false if not found
 */
export async function deleteUser(
  id: string | Types.ObjectId
): Promise<boolean> {
  const result = await User.findByIdAndDelete(id);
  return result !== null;
}
