import { create } from 'zustand';
import { Alert } from 'react-native';

import { contactsService, type AppContact, type ContactCreateInput } from '@/services/contacts.service';

type ContactsState = {
  contacts: AppContact[];
  favoriteContacts: AppContact[];
  loadContacts: () => Promise<void>;
  addContact: (input: ContactCreateInput) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  importFromDeviceContacts: () => Promise<{ addedCount: number }>;
  toggleSos: (id: string) => Promise<void>;
};

const deriveFavorites = (contacts: AppContact[]) => contacts.filter((contact) => contact.isFavorite).slice(0, 6);

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  favoriteContacts: [],
  loadContacts: async () => {
    const contacts = await contactsService.listContacts();
    set({
      contacts,
      favoriteContacts: deriveFavorites(contacts),
    });
  },
  addContact: async (input) => {
    await contactsService.createContact(input);
    await get().loadContacts();
  },
  deleteContact: async (id) => {
    await contactsService.deleteContact(id);
    await get().loadContacts();
  },
  importFromDeviceContacts: async () => {
    const result = await contactsService.importFromDevice();
    await get().loadContacts();
    return result;
  },
  toggleSos: async (id) => {
    const contact = get().contacts.find((entry) => entry.id === id);
    if (!contact) {
      return;
    }

    if (!contact.isSos) {
      const sosCount = get().contacts.filter((entry) => entry.isSos).length;
      if (sosCount >= 5) {
        Alert.alert('SOS limit reached', 'You can add up to 5 SOS contacts only.');
        return;
      }
    }

    await contactsService.updateContact(id, { isSos: !contact.isSos });
    await get().loadContacts();
  },
}));
