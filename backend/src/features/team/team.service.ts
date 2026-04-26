// team.service.ts — Data access layer for team member management; interacts with the User model.
import { Types } from 'mongoose';
import { User } from '../auth/User.model';
import { IUser, UserRole, UserPosition } from '../auth/auth.types';
import { getActivitiesByUserIds } from '../activity/activity.service';
import { ActivityRecordDto } from '../activity/activity.types';

interface TeamMemberResponse {
  id: string;
  name: string;
  position: UserPosition;
  email: string;
  phone: string;
  role: UserRole;
  activities: ActivityRecordDto[];
}

/**
 * Retrieves all users from the database, excluding passwords.
 * @returns Array of user documents
 */
export async function getAllTeamMembers(includeActivities = false): Promise<TeamMemberResponse[]> {
  const users = await User.find().select('-password').sort({ createdAt: 1 });
  const team = users.map(u => u.toJSON()) as unknown as TeamMemberResponse[];

  if (!includeActivities) {
    return team.map((member) => ({ ...member, activities: [] }));
  }

  const activities = await getActivitiesByUserIds(team.map((member) => member.id));
  const activitiesByUserId = new Map<string, ActivityRecordDto[]>();

  activities.forEach((activity) => {
    if (!activity.performedById) return;
    const existing = activitiesByUserId.get(activity.performedById) ?? [];
    existing.push(activity);
    activitiesByUserId.set(activity.performedById, existing);
  });

  return team.map((member) => ({
    ...member,
    activities: activitiesByUserId.get(member.id) ?? [],
  }));
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
  const updated = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');
  return updated?.toJSON() || null;
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
