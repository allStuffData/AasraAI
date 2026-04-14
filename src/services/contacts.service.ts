import * as Contacts from 'expo-contacts';

import { database } from '@/db/migrations';
import { fuzzyMatchContact } from '@/utils/fuzzy-match';

export type AppContact = {
  id: string;
  displayName: string;
  primaryPhone: string;
  relationship: string;
  photoUri: string | null;
  aliases: string[];
  isFavorite: boolean;
  isSos: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContactCreateInput = Pick<AppContact, 'displayName' | 'primaryPhone' | 'relationship' | 'aliases' | 'isFavorite' | 'isSos'> & {
  photoUri?: string | null;
};

const mapRowToContact = (row: Record<string, unknown>): AppContact => ({
  id: String(row.id),
  displayName: String(row.display_name),
  primaryPhone: String(row.primary_phone),
  relationship: String(row.relationship ?? ''),
  photoUri: row.photo_uri ? String(row.photo_uri) : null,
  aliases: JSON.parse(String(row.aliases_json ?? '[]')) as string[],
  isFavorite: Number(row.is_favorite) === 1,
  isSos: Number(row.is_sos) === 1,
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
});

const makeId = () => `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const contactsService = {
  async listContacts() {
    const rows = database.getAllSync<Record<string, unknown>>('SELECT * FROM contacts ORDER BY display_name COLLATE NOCASE ASC;');
    return rows.map(mapRowToContact);
  },

  async createContact(input: ContactCreateInput) {
    const now = new Date().toISOString();
    const id = makeId();

    database.runSync(
      `INSERT INTO contacts (
        id, display_name, primary_phone, relationship, photo_uri, aliases_json, is_favorite, is_sos, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.displayName,
        input.primaryPhone,
        input.relationship,
        input.photoUri ?? null,
        JSON.stringify(input.aliases),
        input.isFavorite ? 1 : 0,
        input.isSos ? 1 : 0,
        now,
        now,
      ],
    );

    return {
      id,
      ...input,
      photoUri: input.photoUri ?? null,
      createdAt: now,
      updatedAt: now,
    } satisfies AppContact;
  },

  async updateContact(id: string, input: Partial<ContactCreateInput>) {
    const current = database.getFirstSync<Record<string, unknown>>('SELECT * FROM contacts WHERE id = ? LIMIT 1;', [id]);
    if (!current) {
      return null;
    }

    const existing = mapRowToContact(current);
    const updated = {
      ...existing,
      ...input,
      aliases: input.aliases ?? existing.aliases,
      updatedAt: new Date().toISOString(),
    };

    database.runSync(
      `UPDATE contacts
      SET display_name = ?, primary_phone = ?, relationship = ?, photo_uri = ?, aliases_json = ?, is_favorite = ?, is_sos = ?, updated_at = ?
      WHERE id = ?`,
      [
        updated.displayName,
        updated.primaryPhone,
        updated.relationship,
        updated.photoUri,
        JSON.stringify(updated.aliases),
        updated.isFavorite ? 1 : 0,
        updated.isSos ? 1 : 0,
        updated.updatedAt,
        id,
      ],
    );

    return updated;
  },

  async deleteContact(id: string) {
    database.runSync('DELETE FROM contacts WHERE id = ?', [id]);
  },

  async importFromDevice() {
    const permission = await Contacts.requestPermissionsAsync();
    if (!permission.granted) {
      return { addedCount: 0 };
    }

    const result = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
      sort: Contacts.SortTypes.FirstName,
    });

    let addedCount = 0;

    for (const deviceContact of result.data) {
      const primaryNumber = deviceContact.phoneNumbers?.[0]?.number;
      if (!deviceContact.name || !primaryNumber) {
        continue;
      }

      const existing = database.getFirstSync<Record<string, unknown>>(
        'SELECT id FROM contacts WHERE primary_phone = ? LIMIT 1;',
        [primaryNumber],
      );

      if (existing) {
        continue;
      }

      await this.createContact({
        displayName: deviceContact.name,
        primaryPhone: primaryNumber,
        relationship: '',
        photoUri: deviceContact.imageAvailable ? deviceContact.image?.uri ?? null : null,
        aliases: [],
        isFavorite: false,
        isSos: false,
      });

      addedCount += 1;
    }

    return { addedCount };
  },

  async fuzzyFind(query: string) {
    const contacts = await this.listContacts();
    return fuzzyMatchContact(query, contacts);
  },
};

