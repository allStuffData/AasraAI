import { contactsService } from '@/services/contacts.service';
import { callService } from '@/services/call.service';
import { smsService } from '@/services/sms.service';
import { settingsStore } from '@/stores/settings.store';

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

  async trigger(locationLink?: string) {
    const { primary, recipients } = await this.buildEmergencyRecipients();
    if (!primary) {
      throw new Error('No SOS contact configured.');
    }

    const message = `Emergency alert from Aasra user.${locationLink ? ` Location: ${locationLink}` : ''}`;
    await Promise.all([
      callService.startCall(primary.primaryPhone),
      smsService.sendMessage(
        recipients.map((entry) => entry.primaryPhone),
        message,
      ),
    ]);
  },
};

