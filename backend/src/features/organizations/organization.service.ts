// organization.service.ts — Data access layer for all organization-related MongoDB queries.
import { Types } from 'mongoose';
import { Organization } from './Organization.model';
import { IOrganization, CreateOrgBody, UpdateOrgBody } from './organization.types';

/**
 * Retrieves all organization documents sorted by creation date.
 * @returns Array of organization documents
 */
export async function getAllOrgs(): Promise<IOrganization[]> {
  return Organization.find().sort({ createdAt: 1 });
}

/**
 * Creates and persists a new organization.
 * @param data - Organization creation details
 * @returns Newly created organization document
 */
export async function createOrg(data: CreateOrgBody): Promise<IOrganization> {
  const org = new Organization(data);
  await org.save();
  return org;
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
  return Organization.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}
