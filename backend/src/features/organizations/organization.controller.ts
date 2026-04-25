// organization.controller.ts — Controller for organization management; restricted to Admin for mutations.
import { Request, Response } from 'express';
import { AppError } from '../../shared/errorHandler';
import { sendSuccess } from '../../shared/response';
import { getAllOrgs, createOrg, updateOrg } from './organization.service';
import { CreateOrgBody, UpdateOrgBody } from './organization.types';
import { UserRole } from '../auth/auth.types';

/**
 * Retrieves a list of all organizations.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function listOrgs(req: Request, res: Response): Promise<void> {
  const orgs = await getAllOrgs();
  sendSuccess(res, orgs);
}

/**
 * Creates a new organization; requires Admin role.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function addOrg(req: Request, res: Response): Promise<void> {
  if (req.user.role !== UserRole.Admin) {
    throw new AppError('Only admins can create organizations', 403);
  }
  const { name } = req.body as CreateOrgBody;
  const org = await createOrg({ name });
  sendSuccess(res, org, 'Organization created', 201);
}

/**
 * Updates organization settings (templates, proposal data); requires Admin role.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function editOrg(req: Request, res: Response): Promise<void> {
  if (req.user.role !== UserRole.Admin) {
    throw new AppError('Only admins can update organizations', 403);
  }
  const updates = req.body as UpdateOrgBody;
  const org = await updateOrg(req.params.id as string, updates);
  if (!org) throw new AppError('Organization not found', 404);
  sendSuccess(res, org, 'Organization updated');
}
