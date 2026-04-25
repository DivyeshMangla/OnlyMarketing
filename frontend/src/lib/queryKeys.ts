export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  organizations: {
    all: ['orgs'] as const,
    discover: ['orgs', 'discover'] as const,
  },
  contacts: {
    list: (orgId: string) => ['contacts', orgId] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
  },
  team: {
    all: ['team'] as const,
  },
};
