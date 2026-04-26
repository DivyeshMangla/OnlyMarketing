// apollo.service.ts — Server-side Apollo.io API adapter; normalizes external search results for the UI.
import { config } from '../../config';
import { AppError } from '../../shared/errorHandler';
import { ApolloCompany, ApolloContact } from './apollo.types';

const APOLLO_BASE_URL = 'https://api.apollo.io/api/v1';
const PEOPLE_TITLES = [
  'marketing',
  'brand marketing',
  'partnerships',
  'strategic partnerships',
  'business development',
  'corporate partnerships',
  'sponsorship',
  'sponsorships',
  'alliances',
  'events marketing',
  'campus marketing',
];
const PEOPLE_SENIORITIES = ['c_suite', 'vp', 'head', 'director', 'manager', 'partner', 'owner'];

type ApolloRecord = Record<string, unknown>;

function requireApolloKey(): string {
  if (!config.apolloKey) {
    throw new AppError('Apollo integration is not configured', 503);
  }
  return config.apolloKey;
}

function asRecord(value: unknown): ApolloRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as ApolloRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function firstString(record: ApolloRecord, keys: string[]): string {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value) return value;
  }
  return '';
}

function stripDomain(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return '';
  return trimmed
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0];
}

function domainFromWebsite(value: string): string {
  try {
    const url = value.startsWith('http') ? new URL(value) : new URL(`https://${value}`);
    return stripDomain(url.hostname);
  } catch {
    return stripDomain(value);
  }
}

function formatLocation(record: ApolloRecord): string {
  const parts = [
    firstString(record, ['city']),
    firstString(record, ['state']),
    firstString(record, ['country']),
  ].filter(Boolean);
  return parts.join(', ');
}

function formatSize(record: ApolloRecord, employeeCount?: number): string {
  const range = firstString(record, [
    'estimated_num_employees_range',
    'employee_count_range',
    'num_employees_range',
  ]);
  if (range) return range;
  if (employeeCount !== undefined) return `${employeeCount.toLocaleString('en-US')} employees`;
  return '';
}

function appendList(params: URLSearchParams, key: string, values: string[]): void {
  values.forEach((value) => params.append(key, value));
}

async function parseApolloError(response: Response): Promise<string> {
  const fallback = `Apollo request failed with status ${response.status}`;
  try {
    const body = asRecord(await response.json());
    const message = firstString(body, ['message', 'error']);
    return message || fallback;
  } catch {
    return fallback;
  }
}

function mapApolloStatus(status: number): number {
  if (status === 401) return 502;
  if (status === 403) return 502;
  if (status === 429) return 429;
  return 502;
}

async function apolloPost<T>(path: string, params: URLSearchParams): Promise<T> {
  const apiKey = requireApolloKey();
  const url = `${APOLLO_BASE_URL}${path}?${params.toString()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const message = await parseApolloError(response);
    throw new AppError(message, mapApolloStatus(response.status));
  }

  return response.json() as Promise<T>;
}

function normalizeCompany(input: unknown): ApolloCompany | null {
  const record = asRecord(input);
  const id = firstString(record, ['organization_id', 'id', '_id']);
  const name = firstString(record, ['name', 'organization_name']);
  const websiteUrl = firstString(record, ['website_url', 'website', 'url']);
  const domain = stripDomain(firstString(record, ['primary_domain', 'domain', 'organization_domain'])) || domainFromWebsite(websiteUrl);

  if (!id || !name) return null;

  const employeeCount = asNumber(
    record.estimated_num_employees ??
    record.num_employees ??
    record.employee_count ??
    record.employees
  );

  return {
    id,
    name,
    domain,
    logoUrl: firstString(record, ['logo_url', 'logoUrl', 'logo']),
    websiteUrl,
    industry: firstString(record, ['industry', 'industry_name']),
    location: formatLocation(record),
    employeeCount,
    size: formatSize(record, employeeCount),
  };
}

function normalizeContact(input: unknown): ApolloContact | null {
  const record = asRecord(input);
  const id = firstString(record, ['id', 'person_id', '_id']);
  if (!id) return null;

  const organization = asRecord(record.organization);
  const firstName = firstString(record, ['first_name', 'firstName']);
  const lastName = firstString(record, ['last_name', 'lastName', 'last_name_obfuscated']);
  const fullName = firstString(record, ['name']) || [firstName, lastName].filter(Boolean).join(' ');
  const hasDirectPhone = firstString(record, ['has_direct_phone']).toLowerCase();
  const emailStatus = firstString(record, ['email_status']).toLowerCase();

  return {
    id,
    name: fullName || 'Unknown contact',
    title: firstString(record, ['title', 'headline']),
    seniority: firstString(record, ['seniority']),
    location: formatLocation(record),
    organizationName: firstString(organization, ['name']),
    linkedinUrl: firstString(record, ['linkedin_url', 'linkedinUrl']),
    photoUrl: firstString(record, ['photo_url', 'photoUrl']),
    hasEmail: record.has_email === true || ['verified', 'unverified', 'likely to engage'].includes(emailStatus),
    hasPhone: hasDirectPhone === 'yes' || hasDirectPhone.startsWith('maybe') || Array.isArray(record.phone_numbers),
    apolloUrl: `https://app.apollo.io/#/people/${id}`,
  };
}

export async function searchApolloCompanies(query: string): Promise<ApolloCompany[]> {
  const params = new URLSearchParams();
  params.set('q_organization_name', query);
  params.set('page', '1');
  params.set('per_page', '5');

  const payload = asRecord(await apolloPost('/mixed_companies/search', params));
  const organizations = Array.isArray(payload.organizations)
    ? payload.organizations
    : Array.isArray(payload.companies)
      ? payload.companies
      : [];

  return organizations
    .map(normalizeCompany)
    .filter((company): company is ApolloCompany => company !== null);
}

export async function searchApolloContacts(organizationId: string, domain?: string): Promise<ApolloContact[]> {
  const params = new URLSearchParams();
  params.set('page', '1');
  params.set('per_page', '25');
  params.set('include_similar_titles', 'true');
  appendList(params, 'person_titles[]', PEOPLE_TITLES);
  appendList(params, 'person_seniorities[]', PEOPLE_SENIORITIES);

  if (organizationId) {
    params.append('organization_ids[]', organizationId);
  } else if (domain) {
    params.append('q_organization_domains_list[]', stripDomain(domain));
  }

  const payload = asRecord(await apolloPost('/mixed_people/api_search', params));
  const people = Array.isArray(payload.people)
    ? payload.people
    : Array.isArray(payload.contacts)
      ? payload.contacts
      : [];

  return people
    .map(normalizeContact)
    .filter((contact): contact is ApolloContact => contact !== null);
}
