import Fuse from 'fuse.js';

import type { AppContact } from '@/services/contacts.service';

export type ContactMatch = {
  contact: AppContact;
  score: number;
};

export const normalizeSearchText = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[^\w\s+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const buildContactsFuse = (contacts: AppContact[]) =>
  new Fuse(contacts, {
    includeScore: true,
    threshold: 0.36,
    ignoreLocation: true,
    keys: [
      { name: 'displayName', weight: 0.55 },
      { name: 'relationship', weight: 0.25 },
      { name: 'aliases', weight: 0.2 },
    ],
    getFn: (object, path) => {
      const value = Fuse.config.getFn(object, path as string);
      if (Array.isArray(value)) {
        return value.map((entry) => normalizeSearchText(String(entry)));
      }

      return normalizeSearchText(String(value ?? ''));
    },
  });

export const fuzzyMatchContact = (query: string, contacts: AppContact[]): ContactMatch[] => {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = normalizeSearchText(query);
  const fuse = buildContactsFuse(contacts);

  return fuse.search(normalizedQuery, { limit: 5 }).map((result) => ({
    contact: result.item,
    score: result.score ?? 1,
  }));
};

