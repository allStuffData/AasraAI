const INTERNET_PROBE_URL = 'https://clients3.google.com/generate_204';

const offlineMessages = {
  hi: 'Internet connection nahi hai. Aap neeche diye gaye favorite contacts ko tap karke call kar sakte hain. Voice features abhi band hain.',
  en: 'Internet is unavailable. You can still tap a favorite contact below to place a call. Voice features are disabled for now.',
} as const;

export const networkService = {
  async hasInternetConnection(timeoutMs = 3500) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(INTERNET_PROBE_URL, {
        method: 'GET',
        signal: controller.signal,
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  },

  getOfflineMessage(language: 'hi' | 'en' = 'en') {
    return language === 'hi' ? `${offlineMessages.hi} ${offlineMessages.en}` : `${offlineMessages.en} ${offlineMessages.hi}`;
  },
};
