// contact.controller.ts — Controller for contact management; handles CRUD operations for outreach contacts.
import { Request, Response } from 'express';
import { AppError } from '../../shared/errorHandler';
import { sendSuccess } from '../../shared/response';
import {
  getContactsByOrg,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from './contact.service';
import { CreateContactBody, UpdateContactBody } from './contact.types';
import { Organization } from '../organizations/Organization.model';
import { UserRole } from '../auth/auth.types';

/**
 * Helper to verify if a user has access to an organization.
 */
async function verifyOrgAccess(orgId: string, userId: string, role: string): Promise<void> {
  if (role === UserRole.Admin) return;
  if (orgId === 'none') return; // Personal contacts are always accessible

  const org = await Organization.findOne({
    _id: orgId,
    members: { $elemMatch: { userId, status: 'Approved' } }
  });

  if (!org) {
    throw new AppError('You do not have access to this organization', 403);
  }
}

/**
 * Retrieves all contacts belonging to a specific organization.
 */
export async function getByOrg(req: Request, res: Response): Promise<void> {
  const orgId = req.params.orgId as string;
  await verifyOrgAccess(orgId, req.user._id, req.user.role);
  
  const contacts = await getContactsByOrg(orgId);
  sendSuccess(res, contacts);
}

/**
 * Retrieves full details for a single contact.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const contact = await getContactById(req.params.id as string);
  if (!contact) throw new AppError('Contact not found', 404);
  
  if (contact.orgId) {
    await verifyOrgAccess(contact.orgId.toString(), req.user._id, req.user.role);
  }
  
  sendSuccess(res, contact);
}

/**
 * Creates a new contact.
 */
export async function addContact(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateContactBody;
  await verifyOrgAccess(body.orgId, req.user._id, req.user.role);
  
  const contact = await createContact(body, req.user.name);
  sendSuccess(res, contact, 'Contact created', 201);
}

/**
 * Updates an existing contact.
 */
export async function editContact(req: Request, res: Response): Promise<void> {
  const contact = await getContactById(req.params.id as string);
  if (!contact) throw new AppError('Contact not found', 404);
  
  if (contact.orgId) {
    await verifyOrgAccess(contact.orgId.toString(), req.user._id, req.user.role);
  }

  const updates = req.body as UpdateContactBody;
  const updated = await updateContact(req.params.id as string, updates, req.user.name);
  sendSuccess(res, updated, 'Contact updated');
}

/**
 * Deletes a contact.
 */
export async function removeContact(req: Request, res: Response): Promise<void> {
  const contact = await getContactById(req.params.id as string);
  if (!contact) throw new AppError('Contact not found', 404);
  
  if (contact.orgId) {
    await verifyOrgAccess(contact.orgId.toString(), req.user._id, req.user.role);
  }

  await deleteContact(req.params.id as string);
  sendSuccess(res, null, 'Contact removed');
}
