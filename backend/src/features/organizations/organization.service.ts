// organization.service.ts — Data access layer for all organization-related MongoDB queries.
import { Types } from 'mongoose';
import { Organization } from './Organization.model';
import { IOrganization, CreateOrgBody, UpdateOrgBody, OrgRole, MemberStatus } from './organization.types';

/**
 * Retrieves organizations for a user. Admins get all, others get only approved memberships.
 * @param userId - Requesting user's ID
 * @param isAdmin - Whether the user is a system admin
 * @returns Array of organization documents
 */
export async function getAllOrgs(userId: string | Types.ObjectId, isAdmin: boolean = false): Promise<IOrganization[]> {
  const query = isAdmin ? {} : { 'members': { $elemMatch: { userId, status: 'Approved' } } };
  return Organization.find(query).populate('members.userId', 'name email').sort({ createdAt: 1 });
}

/**
 * Lightweight list of organizations for discovery.
 * @param userId - User ID to exclude orgs they already joined
 * @returns Simple org objects
 */
export async function getDiscoverOrgs(userId: string | Types.ObjectId): Promise<Partial<IOrganization>[]> {
  return Organization.find({ 'members.userId': { $ne: userId } })
    .select('name _id')
    .sort({ name: 1 })
    .lean();
}

/**
 * Creates and persists a new organization, setting the creator as Approved Owner.
 * @param data - Organization creation details
 * @param ownerId - ID of the creating user
 * @returns Newly created organization document
 */
export async function createOrg(data: CreateOrgBody, ownerId: string | Types.ObjectId): Promise<IOrganization> {
  const org = new Organization({
    ...data,
    members: [{
      userId: ownerId,
      role: 'Owner',
      status: 'Approved'
    }]
  });
  await org.save();
  const populated = await Organization.findById(org._id).populate('members.userId', 'name email');
  return populated?.toJSON() as unknown as IOrganization;
}

/**
 * Submits a join request for an organization.
 * @param orgId - Organization ID
 * @param userId - Requesting user's ID
 */
export async function requestJoin(orgId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<IOrganization | null> {
  const updated = await Organization.findByIdAndUpdate(
    orgId,
    { $addToSet: { members: { userId, role: 'Member', status: 'Pending' } } },
    { new: true }
  ).populate('members.userId', 'name email');
  return updated?.toJSON() || null;
}

/**
 * Updates a member's status or role.
 * @param orgId - Organization ID
 * @param userId - Member user ID
 * @param updates - Partial status or role updates
 */
export async function updateMember(
  orgId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  updates: { status?: MemberStatus; role?: OrgRole }
): Promise<IOrganization | null> {
  const org = await Organization.findById(orgId);
  if (!org) return null;

  const member = org.members.find(m => m.userId.toString() === userId.toString());
  if (!member) return null;

  if (updates.status) member.status = updates.status;
  if (updates.role) member.role = updates.role;

  await org.save();
  const populated = await Organization.findById(orgId).populate('members.userId', 'name email');
  return populated?.toJSON() || null;
}

/**
 * Removes a member or rejects a request.
 */
export async function removeMember(orgId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<IOrganization | null> {
  const updated = await Organization.findByIdAndUpdate(
    orgId,
    { $pull: { members: { userId } } },
    { new: true }
  ).populate('members.userId', 'name email');
  return updated?.toJSON() || null;
}

/**
 * Updates an organization's settings or assets.
 * @param id - Organization's MongoDB ID
 * @param updates - Partial updates
 * @returns Updated organization document or null
 */
export async function updateOrg(
  id: string | Types.ObjectId,
  updates: UpdateOrgBody
): Promise<IOrganization | null> {
  const updated = await Organization.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate('members.userId', 'name email');
  return updated?.toJSON() || null;
}
