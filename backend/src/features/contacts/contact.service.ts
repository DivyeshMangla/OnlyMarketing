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
  const contacts = await Contact.find(query)
    .select('-activity') // Exclude heavy activity logs for list view
    .sort({ createdAt: -1 })
    .lean();
  
  return contacts.map(c => ({ 
    ...c, 
    id: c._id.toString(),
    addedById: c.addedById ? c.addedById.toString() : undefined,
    date: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  })) as unknown as IContact[];
}

/**
 * Retrieves a single contact with full details (including activity).
 * @param id - Contact ID
 * @returns Contact document or null
 */
export async function getContactById(id: string | Types.ObjectId): Promise<IContact | null> {
  const contact = await Contact.findById(id).lean();
  if (!contact) return null;
  return { 
    ...contact, 
    id: contact._id.toString(),
    addedById: contact.addedById ? contact.addedById.toString() : undefined,
    date: new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } as unknown as IContact;
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
  addedByName: string,
  addedById: string | Types.ObjectId
): Promise<IContact> {
  const contact = new Contact({
    ...data,
    orgId: data.orgId === 'none' ? undefined : data.orgId,
    addedBy: addedByName,
    addedById,
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
  return {
    ...contact.toObject(),
    id: contact._id.toString(),
    addedById: contact.addedById ? contact.addedById.toString() : undefined,
    date: new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } as unknown as IContact;
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
  const existing = await Contact.findById(id).select('status notes name activity').lean();
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

  if (updates.newActivity) {
    newActivities.push({
      type: updates.newActivity.type,
      desc: updates.newActivity.desc,
      date: new Date(),
      performedBy: performedByName,
      contactName: existing.name,
    });
  }

  const updated = await Contact.findByIdAndUpdate(
    id,
    {
      ...updates,
      ...(newActivities.length > 0
        ? { $push: { activity: { $each: newActivities } } }
        : {}),
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return null;
  return { 
    ...updated, 
    id: updated._id.toString(),
    addedById: updated.addedById ? updated.addedById.toString() : undefined,
    date: new Date(updated.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } as unknown as IContact;
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
