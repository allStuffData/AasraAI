import * as Linking from 'expo-linking';

export const callService = {
  async startCall(phoneNumber: string) {
    const url = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('Phone dialer is not available on this device.');
    }

    await Linking.openURL(url);
  },
};

