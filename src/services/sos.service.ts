import { contactsService } from '@/services/contacts.service';
import { callService } from '@/services/call.service';
import { smsService } from '@/services/sms.service';
import { settingsStore } from '@/stores/settings.store';
import * as Location from 'expo-location';

import { permissionsService } from '@/services/permissions.service';
import type { SupportedLanguage } from '@/utils/intent-parser';

const EMERGENCY_NUMBER = '112';

const buildLocationLink = async (language: SupportedLanguage) => {
  const granted = await permissionsService.ensureLocationAccess(language);
  if (!granted) {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
};

export const sosService = {
  async buildEmergencyRecipients() {
    const contacts = await contactsService.listContacts();
    const recipients = contacts.filter((contact) => contact.isSos);
    const primaryId = settingsStore.getState().primarySosContactId;
    const primary = recipients.find((contact) => contact.id === primaryId) ?? recipients[0] ?? null;

    return {
      primary,
      recipients,
    };
  },

  async trigger(options?: {
    locationLink?: string;
    language?: SupportedLanguage;
    callEmergencyNumber?: boolean;
  }) {
    const { primary, recipients } = await this.buildEmergencyRecipients();
    if (!primary) {
      throw new Error('No SOS contact configured.');
    }

    const language = options?.language ?? 'en';
    const locationLink = options?.locationLink ?? (await buildLocationLink(language)) ?? undefined;
    const message = `Emergency alert from Aasra user.${locationLink ? ` Location: ${locationLink}` : ''}`;
    const shouldCallEmergencyNumber = options?.callEmergencyNumber ?? settingsStore.getState().callEmergencyNumberInSos;
    const callTarget = shouldCallEmergencyNumber
      ? { phoneNumber: EMERGENCY_NUMBER, contactName: '112' }
      : { phoneNumber: primary.primaryPhone, contactName: primary.displayName, contactId: primary.id };

    const tasks: Promise<unknown>[] = [
      callService.startCall({
        phoneNumber: callTarget.phoneNumber,
        contactId: 'contactId' in callTarget ? callTarget.contactId : undefined,
        contactName: callTarget.contactName,
        language,
      }),
      smsService.sendMessage(
        recipients.map((entry) => ({
          contactId: entry.id,
          contactName: entry.displayName,
          phoneNumber: entry.primaryPhone,
        })),
        message,
        language,
      ),
    ];

    await Promise.all(tasks);

    return {
      primary,
      recipients,
      locationLink: locationLink ?? null,
      calledEmergencyNumber: shouldCallEmergencyNumber,
    };
  },
};
