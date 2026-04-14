import * as Speech from 'expo-speech';

import { settingsStore } from '@/stores/settings.store';

export const ttsService = {
  async speak(text: string, language?: string) {
    const rate = settingsStore.getState().ttsRate;
    const preference = settingsStore.getState().languagePreference;
    const resolvedLanguage = language ?? (preference === 'hi' ? 'hi-IN' : 'en-IN');

    Speech.speak(text, {
      language: resolvedLanguage,
      pitch: 1,
      rate,
    });
  },

  async stop() {
    Speech.stop();
  },
};
