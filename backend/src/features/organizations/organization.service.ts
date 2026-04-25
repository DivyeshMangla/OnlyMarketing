// organization.service.ts — Data access layer for all organization-related MongoDB queries.
import { Types } from 'mongoose';
import { Organization } from './Organization.model';
import { IOrganization, CreateOrgBody, UpdateOrgBody, OrgRole, MemberStatus } from './organization.types';

type PopulatedUser = {
  _id?: Types.ObjectId | string;
  id?: string;
  name?: string;
  email?: string;
};

type RawOrgMember = {
  userId: Types.ObjectId | string | PopulatedUser;
  role: OrgRole;
  status: MemberStatus;
};

type RawOrganization = {
  _id: Types.ObjectId | string;
  name: string;
  proposalFileName?: string;
  proposalData?: string;
  emailTemplate?: string;
  whatsappTemplate?: string;
  instaTemplate?: string;
  members?: RawOrgMember[];
  createdAt?: Date;
  updatedAt?: Date;
};

function isPopulatedUser(value: RawOrgMember['userId']): value is PopulatedUser {
  return typeof value === 'object' && value !== null && ('name' in value || 'email' in value || '_id' in value || 'id' in value);
}

function toUserIdString(value: RawOrgMember['userId']): string {
  if (isPopulatedUser(value)) {
    return String(value._id ?? value.id ?? '');
  }
  return String(value);
}

function normalizeOrg(org: RawOrganization | null): IOrganization | null {
  if (!org) return null;

  return {
    ...org,
    id: String(org._id),
    members: (org.members ?? []).map((member) => ({
      userId: toUserIdString(member.userId),
      user: isPopulatedUser(member.userId)
        ? {
            name: member.userId.name ?? 'Unknown',
            email: member.userId.email ?? '',
          }
        : undefined,
      role: member.role,
      status: member.status,
    })),
  } as unknown as IOrganization;
}

async function getOrgByIdWithMembers(id: string | Types.ObjectId): Promise<IOrganization | null> {
  const org = await Organization.findById(id)
    .populate('members.userId', 'name email')
    .lean<RawOrganization | null>();

  return normalizeOrg(org);
}

/**
 * Retrieves organizations for a user. Admins get all, others get only approved memberships.
 * @param userId - Requesting user's ID
 * @param isAdmin - Whether the user is a system admin
 * @returns Array of organization documents
 */
export async function getAllOrgs(userId: string | Types.ObjectId, isAdmin: boolean = false): Promise<IOrganization[]> {
  const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
  const query = isAdmin ? {} : { 'members': { $elemMatch: { userId: uid, status: 'Approved' } } };
  const orgs = await Organization.find(query)
    .populate('members.userId', 'name email')
    .sort({ createdAt: 1 })
    .lean<RawOrganization[]>();

  return orgs
    .map((org) => normalizeOrg(org))
    .filter((org): org is IOrganization => org !== null);
}

/**
 * Lightweight list of organizations for discovery.
 * @param userId - User ID to exclude orgs they already joined
 * @returns Simple org objects
 */
export async function getDiscoverOrgs(userId: string | Types.ObjectId): Promise<Partial<IOrganization>[]> {
  const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
  const orgs = await Organization.find({ 'members.userId': { $ne: uid } })
    .select('name _id')
    .sort({ name: 1 })
    .lean();
  
  return orgs.map(o => ({
    id: o._id.toString(),
    name: o.name
  }));
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
  const populated = await getOrgByIdWithMembers(org._id);
  if (!populated) {
    throw new Error('Failed to load organization after creation');
  }
  return populated;
}

/**
 * Submits a join request for an organization.
 * @param orgId - Organization ID
 * @param userId - Requesting user's ID
 */
export async function requestJoin(orgId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<IOrganization | null> {
  await Organization.findByIdAndUpdate(
    orgId,
    { $addToSet: { members: { userId, role: 'Member', status: 'Pending' } } },
    { new: true }
  );

  return getOrgByIdWithMembers(orgId);
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
  return getOrgByIdWithMembers(orgId);
}

/**
 * Removes a member or rejects a request.
 */
export async function removeMember(orgId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<IOrganization | null> {
  const targetUserId =
    typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

  await Organization.findByIdAndUpdate(
    orgId,
    { $pull: { members: { userId: targetUserId } } },
    { new: true }
  );

  return getOrgByIdWithMembers(orgId);
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
  await Organization.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  return getOrgByIdWithMembers(id);
}

/**
 * Permanently deletes an organization and all associated data.
 * @param id - Organization ID
 * @returns True if deleted
 */
export async function deleteOrg(id: string | Types.ObjectId): Promise<boolean> {
  const result = await Organization.findByIdAndDelete(id);
  return result !== null;
}
