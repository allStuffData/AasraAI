import * as SMS from 'expo-sms';

import { database } from '@/db/migrations';
import { contactsService } from '@/services/contacts.service';
import { permissionsService } from '@/services/permissions.service';
import type { SupportedLanguage } from '@/utils/intent-parser';

export type SmsRecipient = {
  phoneNumber: string;
  contactId?: string | null;
  contactName?: string | null;
};

type SmsLogRow = {
  id: string;
  contact_id: string | null;
  contact_name: string;
  phone_number: string;
  message_body: string;
  direction: 'incoming' | 'outgoing';
  delivery_status: string;
  created_at: string;
};

const makeId = () => `sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const normalizePhoneNumber = (value: string) => value.replace(/[^\d+#*]/g, '');
const mapRow = (row: SmsLogRow) => ({
  id: row.id,
  contactId: row.contact_id,
  contactName: row.contact_name,
  phoneNumber: row.phone_number,
  messageBody: row.message_body,
  direction: row.direction,
  deliveryStatus: row.delivery_status,
  createdAt: row.created_at,
});

const buildHistorySummary = (rows: ReturnType<typeof mapRow>[], language: SupportedLanguage) => {
  if (rows.length === 0) {
    return language === 'hi'
      ? 'Abhi tak Aasra ke paas koi recent SMS history nahi hai.'
      : 'There is no recent SMS history in Aasra yet.';
  }

  const intro =
    language === 'hi'
      ? 'Main Aasra ki recent message history padh raha hoon.'
      : 'I am reading the recent Aasra message history.';

  const lines = rows.map((row, index) => {
    const name = row.contactName || row.phoneNumber;
    return language === 'hi'
      ? `Message ${index + 1}, ${name}, ${row.messageBody}.`
      : `Message ${index + 1}, ${name}, ${row.messageBody}.`;
  });

  return `${intro} ${lines.join(' ')}`;
};

export const smsService = {
  async sendMessage(recipients: SmsRecipient[], message: string, language: SupportedLanguage = 'en') {
    await permissionsService.announceSmsAccess(language);

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('SMS is not available on this device.');
    }

    const normalizedRecipients = recipients.map((recipient) => ({
      ...recipient,
      phoneNumber: normalizePhoneNumber(recipient.phoneNumber),
    }));

    const result = await SMS.sendSMSAsync(
      normalizedRecipients.map((recipient) => recipient.phoneNumber),
      message,
    );

    normalizedRecipients.forEach((recipient) => {
      database.runSync(
        `INSERT INTO sms_log (id, contact_id, contact_name, phone_number, message_body, direction, delivery_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          makeId(),
          recipient.contactId ?? null,
          recipient.contactName ?? recipient.phoneNumber,
          recipient.phoneNumber,
          message,
          'outgoing',
          result.result ?? 'unknown',
          new Date().toISOString(),
        ],
      );
    });

    return result;
  },

  async getRecentMessages(limit = 5) {
    const rows = database.getAllSync<SmsLogRow>(
      `SELECT * FROM sms_log ORDER BY created_at DESC LIMIT ?`,
      [limit],
    );

    return rows.map(mapRow);
  },

  async readRecentMessages(limit = 5, language: SupportedLanguage = 'en') {
    const rows = await this.getRecentMessages(limit);
    return buildHistorySummary(rows, language);
  },

  async resolveReplyRecipients(contactHint?: string | null) {
    if (contactHint) {
      const matches = await contactsService.fuzzyFind(contactHint);
      if (matches[0]?.contact) {
        return [
          {
            contactId: matches[0].contact.id,
            contactName: matches[0].contact.displayName,
            phoneNumber: matches[0].contact.primaryPhone,
          },
        ];
      }
    }

    const latest = database.getFirstSync<SmsLogRow>('SELECT * FROM sms_log ORDER BY created_at DESC LIMIT 1');
    if (!latest) {
      return [];
    }

    return [
      {
        contactId: latest.contact_id,
        contactName: latest.contact_name,
        phoneNumber: latest.phone_number,
      },
    ];
  },
};
