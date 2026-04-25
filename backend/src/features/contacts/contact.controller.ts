// contact.controller.ts — Controller for contact management; handles CRUD operations for outreach contacts.
import { Request, Response } from 'express';
import { AppError } from '../../shared/errorHandler';
import { sendSuccess } from '../../shared/response';
import {
  getContactsByOrg,
  createContact,
  updateContact,
  deleteContact,
} from './contact.service';
import { CreateContactBody, UpdateContactBody } from './contact.types';

/**
 * Retrieves all contacts belonging to a specific organization.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function getByOrg(req: Request, res: Response): Promise<void> {
  const contacts = await getContactsByOrg(req.params.orgId as string);
  sendSuccess(res, contacts);
}

/**
 * Creates a new contact and logs the initial activity.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function addContact(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateContactBody;
  const contact = await createContact(body, req.user.name);
  sendSuccess(res, contact, 'Contact created', 201);
}

/**
 * Updates an existing contact's details or status.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function editContact(req: Request, res: Response): Promise<void> {
  const updates = req.body as UpdateContactBody;
  const contact = await updateContact(req.params.id as string, updates, req.user.name);
  if (!contact) throw new AppError('Contact not found', 404);
  sendSuccess(res, contact, 'Contact updated');
}

/**
 * Deletes a contact from the system.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function removeContact(req: Request, res: Response): Promise<void> {
  const deleted = await deleteContact(req.params.id as string);
  if (!deleted) throw new AppError('Contact not found', 404);
  sendSuccess(res, null, 'Contact removed');
}
