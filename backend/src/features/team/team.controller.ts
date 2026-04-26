// team.controller.ts — Controller for team member management; restricted to Admin for role changes and removal.
import { Request, Response } from 'express';
import { AppError } from '../../shared/errorHandler';
import { sendSuccess } from '../../shared/response';
import { getAllTeamMembers, updateUserRole, deleteUser } from './team.service';
import { UserRole } from '../auth/auth.types';

/**
 * Retrieves all registered team members.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function listTeam(req: Request, res: Response): Promise<void> {
  const team = await getAllTeamMembers(req.user.role === UserRole.Admin);
  sendSuccess(res, team);
}

/**
 * Updates a team member's system role (Admin/User).
 * @param req - Express Request
 * @param res - Express Response
 */
export async function setUserRole(req: Request, res: Response): Promise<void> {
  if (req.user.role !== UserRole.Admin) {
    throw new AppError('Only admins can change roles', 403);
  }
  const { role } = req.body as { role: UserRole };
  if (!Object.values(UserRole).includes(role)) {
    throw new AppError('Invalid role value', 400);
  }
  const updated = await updateUserRole(req.params.id as string, role);
  if (!updated) throw new AppError('User not found', 404);
  sendSuccess(res, updated, 'Role updated');
}

/**
 * Permanently removes a user from the system.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function removeMember(req: Request, res: Response): Promise<void> {
  if (req.user.role !== UserRole.Admin) {
    throw new AppError('Only admins can remove users', 403);
  }
  const deleted = await deleteUser(req.params.id as string);
  if (!deleted) throw new AppError('User not found', 404);
  sendSuccess(res, null, 'User removed');
}
