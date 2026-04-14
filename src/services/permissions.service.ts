import { Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import SpeechRecognition from 'expo-speech-recognition';

import { database } from '@/db/migrations';
import type { SupportedLanguage } from '@/utils/intent-parser';

type PermissionKey = 'microphone' | 'contacts' | 'call' | 'sms' | 'location';

const rationaleKey = (permission: PermissionKey) => `permission_rationale_${permission}`;

const readSetting = (key: string) =>
  database.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ? LIMIT 1', [key])?.value ?? null;

const writeSetting = (key: string, value: string) => {
  database.runSync(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value, new Date().toISOString()],
  );
};

const copy = {
  hi: {
    microphone: {
      title: 'Mic permission',
      message: 'Aasra ko aapki awaaz sunne ke liye microphone ki permission chahiye. Isse aap bolkar call, message aur SOS chala sakte hain.',
      denied: 'Microphone permission ke bina voice features kaam nahi karenge.',
    },
    contacts: {
      title: 'Contacts permission',
      message: 'Aasra ko contacts ki permission chahiye taki Raju, Beta, Doctor jaise naam pehchaane ja sakein.',
      denied: 'Contacts permission ke bina contact import aur smart matching limited rahega.',
    },
    call: {
      title: 'Phone call',
      message: 'Aasra ab dialer kholega taki aap seedha call shuru kar sakein.',
    },
    sms: {
      title: 'SMS access',
      message: 'Aasra SMS bhejne aur Aasra ke recent message history ko zor se padhne ke liye messaging access use karega.',
    },
    location: {
      title: 'Location permission',
      message: 'SOS bhejte waqt live jagah share karne ke liye location permission zaroori hai.',
      denied: 'Location permission na hone par SOS mein jagah share nahi ho payegi.',
    },
  },
  en: {
    microphone: {
      title: 'Mic permission',
      message: 'Aasra needs microphone access so it can hear your voice and help with calls, messages, and SOS.',
      denied: 'Voice features will stay disabled until microphone permission is granted.',
    },
    contacts: {
      title: 'Contacts permission',
      message: 'Aasra needs contact access so names like Raju, Beta, or Doctor can be matched correctly.',
      denied: 'Without contacts access, import and smart contact matching stay limited.',
    },
    call: {
      title: 'Phone call',
      message: 'Aasra will open the dialer now so the call can start.',
    },
    sms: {
      title: 'SMS access',
      message: 'Aasra uses SMS access to send messages and read back recent Aasra message history aloud.',
    },
    location: {
      title: 'Location permission',
      message: 'Location access is needed to include your live location in SOS alerts.',
      denied: 'Without location access, SOS can still go out but it will not include your location.',
    },
  },
} as const;

const resolveLanguage = (language?: SupportedLanguage) => (language === 'hi' ? 'hi' : 'en');

const showRationaleOnce = async (permission: PermissionKey, language?: SupportedLanguage) => {
  if (readSetting(rationaleKey(permission)) === '1') {
    return;
  }

  const selected = copy[resolveLanguage(language)][permission];

  await new Promise<void>((resolve) => {
    Alert.alert(selected.title, selected.message, [{ text: 'OK', onPress: resolve }], {
      cancelable: false,
    });
  });

  writeSetting(rationaleKey(permission), '1');
};

export const permissionsService = {
  async ensureMicrophoneAccess(language?: SupportedLanguage) {
    await showRationaleOnce('microphone', language);

    const current = await SpeechRecognition.getPermissionsAsync?.();
    if (current?.granted) {
      return true;
    }

    const requested = await SpeechRecognition.requestPermissionsAsync?.();
    if (requested?.granted) {
      return true;
    }

    Alert.alert(copy[resolveLanguage(language)].microphone.title, copy[resolveLanguage(language)].microphone.denied);
    return false;
  },

  async ensureContactsAccess(language?: SupportedLanguage) {
    await showRationaleOnce('contacts', language);
    const current = await Contacts.getPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await Contacts.requestPermissionsAsync();
    if (requested.granted) {
      return true;
    }

    Alert.alert(copy[resolveLanguage(language)].contacts.title, copy[resolveLanguage(language)].contacts.denied);
    return false;
  },

  async ensureLocationAccess(language?: SupportedLanguage) {
    await showRationaleOnce('location', language);
    const current = await Location.getForegroundPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await Location.requestForegroundPermissionsAsync();
    if (requested.granted) {
      return true;
    }

    Alert.alert(copy[resolveLanguage(language)].location.title, copy[resolveLanguage(language)].location.denied);
    return false;
  },

  async announceCallAccess(language?: SupportedLanguage) {
    await showRationaleOnce('call', language);
    return true;
  },

  async announceSmsAccess(language?: SupportedLanguage) {
    await showRationaleOnce('sms', language);
    return true;
  },
};
