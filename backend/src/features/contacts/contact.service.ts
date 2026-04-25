// contact.service.ts — Data access layer for all contact-related MongoDB queries; includes activity logging.
import { Types } from 'mongoose';
import { Contact } from './Contact.model';
import { IContact, CreateContactBody, UpdateContactBody } from './contact.types';

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Retrieves contacts for an organization, or unassigned contacts if 'none' is specified.
 * @param orgId - Organization ID or 'none'
 * @returns Array of contact documents
 */
export async function getContactsByOrg(orgId: string): Promise<IContact[]> {
  const query = orgId === 'none' ? { orgId: { $exists: false } } : { orgId };
  return Contact.find(query).sort({ createdAt: -1 });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Creates a new contact and initializes their activity log.
 * @param data - Contact creation details
 * @param addedByName - Name of the user adding the contact
 * @returns Newly created contact document
 */
export async function createContact(
  data: CreateContactBody,
  addedByName: string
): Promise<IContact> {
  const contact = new Contact({
    ...data,
    orgId: data.orgId === 'none' ? undefined : data.orgId,
    addedBy: addedByName,
    activity: [
      {
        type: 'Created',
        desc: 'Contact added to list',
        date: new Date(),
        performedBy: addedByName,
        contactName: data.name,
      },
    ],
  });
  await contact.save();
  return contact;
}

/**
 * Updates a contact and automatically logs status or note changes.
 * @param id - Contact's MongoDB ID
 * @param updates - Partial updates
 * @param performedByName - Name of the user performing the update
 * @returns Updated contact document or null
 */
export async function updateContact(
  id: string | Types.ObjectId,
  updates: UpdateContactBody,
  performedByName: string
): Promise<IContact | null> {
  const existing = await Contact.findById(id);
  if (!existing) return null;

  const newActivities: IContact['activity'] = [];

  if (updates.status && updates.status !== existing.status) {
    newActivities.push({
      type: 'Status Changed',
      desc: `Updated from ${existing.status} to ${updates.status}`,
      date: new Date(),
      performedBy: performedByName,
      contactName: existing.name,
    });
  }

  if (updates.notes !== undefined && updates.notes !== existing.notes) {
    newActivities.push({
      type: 'Note Added',
      desc: 'Updated contact notes',
      date: new Date(),
      performedBy: performedByName,
      contactName: existing.name,
    });
  }

  return Contact.findByIdAndUpdate(
    id,
    {
      ...updates,
      ...(newActivities.length > 0
        ? { $push: { activity: { $each: newActivities } } }
        : {}),
    },
    { new: true, runValidators: true }
  );
}

/**
 * Permanently removes a contact from the database.
 * @param id - Contact's MongoDB ID
 * @returns True if deleted, false if not found
 */
export async function deleteContact(
  id: string | Types.ObjectId
): Promise<boolean> {
  const result = await Contact.findByIdAndDelete(id);
  return result !== null;
}
