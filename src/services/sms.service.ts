import * as SMS from 'expo-sms';

export const smsService = {
  async sendMessage(recipients: string[], message: string) {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('SMS is not available on this device.');
    }

    return SMS.sendSMSAsync(recipients, message);
  },
};

