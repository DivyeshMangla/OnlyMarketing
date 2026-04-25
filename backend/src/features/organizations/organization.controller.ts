// organization.controller.ts — Controller for organization management; restricted to Admin for mutations.
import { Request, Response } from 'express';
import { AppError } from '../../shared/errorHandler';
import { sendSuccess } from '../../shared/response';
import { 
  getAllOrgs, 
  createOrg, 
  updateOrg, 
  getDiscoverOrgs, 
  requestJoin, 
  updateMember, 
  removeMember 
} from './organization.service';
import { CreateOrgBody, UpdateOrgBody, OrgRole, MemberStatus } from './organization.types';
import { UserRole } from '../auth/auth.types';

/**
 * Retrieves organizations for the current user. Admins get all.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function listOrgs(req: Request, res: Response): Promise<void> {
  const orgs = await getAllOrgs(req.user._id, req.user.role === UserRole.Admin);
  sendSuccess(res, orgs);
}

/**
 * Lightweight list of organizations for discovery/join requests.
 */
export async function discoverOrgs(req: Request, res: Response): Promise<void> {
  const orgs = await getDiscoverOrgs(req.user._id);
  sendSuccess(res, orgs);
}

/**
 * Creates a new organization.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function addOrg(req: Request, res: Response): Promise<void> {
  const { name } = req.body as CreateOrgBody;
  const org = await createOrg({ name }, req.user._id);
  sendSuccess(res, org, 'Organization created', 201);
}

/**
 * Submits a join request.
 */
export async function submitJoinRequest(req: Request, res: Response): Promise<void> {
  const org = await requestJoin(req.params.id as string, req.user._id);
  if (!org) throw new AppError('Organization not found', 404);
  sendSuccess(res, null, 'Join request submitted');
}

/**
 * Updates organization settings (templates, proposal data).
 * Allowed for Owner or Org Admin.
 */
export async function editOrg(req: Request, res: Response): Promise<void> {
  const org = await getAllOrgs(req.user._id, true).then(orgs => orgs.find(o => o._id.toString() === req.params.id));
  if (!org) throw new AppError('Organization not found', 404);

  const member = org.members.find(m => m.userId.toString() === req.user._id.toString());
  const isSysAdmin = req.user.role === UserRole.Admin;
  const isOrgAdmin = member && (member.role === 'Owner' || member.role === 'Admin') && member.status === 'Approved';

  if (!isSysAdmin && !isOrgAdmin) {
    throw new AppError('Not authorized to edit this organization', 403);
  }

  const updates = req.body as UpdateOrgBody;
  const updated = await updateOrg(req.params.id as string, updates);
  sendSuccess(res, updated, 'Organization updated');
}

/**
 * Updates a member status or role. Only Owner can do this.
 */
export async function updateMemberStatus(req: Request, res: Response): Promise<void> {
  const org = await getAllOrgs(req.user._id, true).then(orgs => orgs.find(o => o._id.toString() === req.params.id));
  if (!org) throw new AppError('Organization not found', 404);

  const requester = org.members.find(m => m.userId.toString() === req.user._id.toString());
  if (requester?.role !== 'Owner' && req.user.role !== UserRole.Admin) {
    throw new AppError('Only the organization owner can manage members', 403);
  }

  const userId = req.params.userId as string;
  const { status, role } = req.body as { status?: MemberStatus; role?: OrgRole };
  const updated = await updateMember(req.params.id as string, userId, { status, role });
  sendSuccess(res, updated, 'Member updated');
}

/**
 * Removes a member or rejects request. Only Owner can do this.
 */
export async function deleteMember(req: Request, res: Response): Promise<void> {
  const org = await getAllOrgs(req.user._id, true).then(orgs => orgs.find(o => o._id.toString() === req.params.id));
  if (!org) throw new AppError('Organization not found', 404);

  const requester = org.members.find(m => m.userId.toString() === req.user._id.toString());
  if (requester?.role !== 'Owner' && req.user.role !== UserRole.Admin) {
    throw new AppError('Only the organization owner can remove members', 403);
  }

  const userId = req.params.userId as string;
  const updated = await removeMember(req.params.id as string, userId);
  sendSuccess(res, updated, 'Member removed');
}
