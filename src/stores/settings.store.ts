import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { database } from '@/db/migrations';

type LanguagePreference = 'auto' | 'hi' | 'en';

type SettingsState = {
  languagePreference: LanguagePreference;
  ttsRate: number;
  apiKey: string;
  caregiverPin: string;
  primarySosContactId: string;
  loadSettings: () => Promise<void>;
  setLanguagePreference: (value: LanguagePreference) => Promise<void>;
  setTtsRate: (value: number) => Promise<void>;
  setApiKey: (value: string) => Promise<void>;
  setCaregiverPin: (value: string) => Promise<void>;
  setPrimarySosContact: (value: string) => Promise<void>;
};

const writeSetting = (key: string, value: string) => {
  database.runSync(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value, new Date().toISOString()],
  );
};

export const settingsStore = create<SettingsState>((set) => ({
  languagePreference: 'auto',
  ttsRate: 0.95,
  apiKey: '',
  caregiverPin: '1234',
  primarySosContactId: '',
  loadSettings: async () => {
    const rows = database.getAllSync<{ key: string; value: string }>('SELECT key, value FROM settings;');
    const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    const apiKey = (await SecureStore.getItemAsync('zai_api_key')) ?? process.env.EXPO_PUBLIC_ZAI_API_KEY ?? '';

    set({
      languagePreference: (values.languagePreference as LanguagePreference) ?? 'auto',
      ttsRate: Number(values.ttsRate ?? '0.95'),
      caregiverPin: values.caregiverPin ?? '1234',
      primarySosContactId: values.primarySosContactId ?? '',
      apiKey,
    });
  },
  setLanguagePreference: async (value) => {
    writeSetting('languagePreference', value);
    set({ languagePreference: value });
  },
  setTtsRate: async (value) => {
    writeSetting('ttsRate', String(value));
    set({ ttsRate: value });
  },
  setApiKey: async (value) => {
    await SecureStore.setItemAsync('zai_api_key', value);
    set({ apiKey: value });
  },
  setCaregiverPin: async (value) => {
    writeSetting('caregiverPin', value);
    set({ caregiverPin: value });
  },
  setPrimarySosContact: async (value) => {
    writeSetting('primarySosContactId', value);
    set({ primarySosContactId: value });
  },
}));

export const useSettingsStore = settingsStore;
