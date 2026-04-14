import * as Linking from 'expo-linking';

import { database } from '@/db/migrations';
import { permissionsService } from '@/services/permissions.service';

type CallRequest = {
  phoneNumber: string;
  contactId?: string | null;
  contactName?: string | null;
  language?: 'hi' | 'en';
};

type ActiveCallAttempt = {
  id: string;
  startedAtMs: number;
};

const normalizePhoneNumber = (value: string) => value.replace(/[^\d+#*]/g, '');
const makeId = () => `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

let activeCallAttempt: ActiveCallAttempt | null = null;

export const callService = {
  async startCall(request: CallRequest) {
    await permissionsService.announceCallAccess(request.language);

    const sanitizedNumber = normalizePhoneNumber(request.phoneNumber);
    const url = `tel:${sanitizedNumber}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('Phone dialer is not available on this device.');
    }

    const startedAt = new Date().toISOString();
    const id = makeId();

    database.runSync(
      `INSERT INTO call_log (id, contact_id, contact_name, phone_number, started_at, duration_seconds, direction)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        request.contactId ?? null,
        request.contactName ?? sanitizedNumber,
        sanitizedNumber,
        startedAt,
        0,
        'outgoing',
      ],
    );

    activeCallAttempt = {
      id,
      startedAtMs: Date.now(),
    };

    await Linking.openURL(url);

    return {
      id,
      startedAt,
      phoneNumber: sanitizedNumber,
    };
  },

  finalizeActiveCallAttempt() {
    if (!activeCallAttempt) {
      return;
    }

    const durationSeconds = Math.max(0, Math.round((Date.now() - activeCallAttempt.startedAtMs) / 1000));
    if (durationSeconds > 0) {
      database.runSync('UPDATE call_log SET duration_seconds = ? WHERE id = ?', [durationSeconds, activeCallAttempt.id]);
    }

    activeCallAttempt = null;
  },
};
