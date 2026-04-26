// apollo.controller.ts — Admin-only Apollo.io search endpoints.
import { Request, Response } from 'express';
import { AppError } from '../../shared/errorHandler';
import { sendSuccess } from '../../shared/response';
import { UserRole } from '../auth/auth.types';
import { searchApolloCompanies, searchApolloContacts } from './apollo.service';
import { ApolloCompanySearchResponse, ApolloContactSearchResponse } from './apollo.types';

function requireAdmin(req: Request): void {
  if (req.user.role !== UserRole.Admin) {
    throw new AppError('Only admins can use Apollo search', 403);
  }
}

function getQueryString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function searchCompanies(req: Request, res: Response): Promise<void> {
  requireAdmin(req);

  const query = getQueryString(req.query.query);
  if (query.length < 2) {
    throw new AppError('Company search query must be at least 2 characters', 400);
  }

  const companies = await searchApolloCompanies(query);
  sendSuccess<ApolloCompanySearchResponse>(res, { companies });
}

export async function searchContacts(req: Request, res: Response): Promise<void> {
  requireAdmin(req);

  const organizationId = getQueryString(req.query.organizationId);
  const domain = getQueryString(req.query.domain);

  if (!organizationId && !domain) {
    throw new AppError('Organization ID or domain is required', 400);
  }

  const contacts = await searchApolloContacts(organizationId, domain);
  sendSuccess<ApolloContactSearchResponse>(res, { contacts });
}
