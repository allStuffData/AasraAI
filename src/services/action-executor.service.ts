import { callService } from '@/services/call.service';
import { smsService } from '@/services/sms.service';
import { sosService } from '@/services/sos.service';
import { ttsService } from '@/services/tts.service';
import type { ParsedIntent } from '@/utils/intent-parser';

const spokenCopy = {
  CALL: {
    hi: (name: string) => `${name} ko call laga raha hoon.`,
    en: (name: string) => `Calling ${name} now.`,
  },
  TEXT: {
    hi: (name: string) => `${name} ko message bhej raha hoon.`,
    en: (name: string) => `Sending a message to ${name}.`,
  },
  SOS: {
    hi: 'SOS bheja ja raha hai. Main abhi madad ke liye call aur message kar raha hoon.',
    en: 'Sending SOS now. I am placing the emergency call and messages.',
  },
  READ_MESSAGES: {
    hi: 'Main recent messages padh raha hoon.',
    en: 'Reading recent messages now.',
  },
  REPLY: {
    hi: (name: string) => `${name} ko reply bhej raha hoon.`,
    en: (name: string) => `Sending a reply to ${name}.`,
  },
  ERROR: {
    hi: 'Yeh action poora nahi ho saka.',
    en: 'I could not complete that action.',
  },
} as const;

const resolveLanguage = (language: ParsedIntent['language']) => (language === 'hi' ? 'hi-IN' : 'en-IN');

export const actionExecutorService = {
  async executeIntent(intent: ParsedIntent) {
    const language = intent.language;
    const contactLabel = intent.contact ?? intent.contactPhone ?? 'this contact';

    switch (intent.intent) {
      case 'CALL': {
        if (!intent.contactPhone) {
          throw new Error(language === 'hi' ? 'Call ke liye phone number nahi mila.' : 'I could not find a phone number for that call.');
        }

        const speech = spokenCopy.CALL[language](contactLabel);
        await ttsService.speak(speech, resolveLanguage(language));
        await callService.startCall({
          phoneNumber: intent.contactPhone,
          contactName: intent.contact ?? intent.contactPhone,
          language,
        });
        return speech;
      }

      case 'TEXT': {
        if (!intent.contactPhone || !intent.messageBody) {
          throw new Error(
            language === 'hi' ? 'Message bhejne ke liye contact aur message dono chahiye.' : 'I need both a contact and message text to send SMS.',
          );
        }

        const speech = spokenCopy.TEXT[language](contactLabel);
        await ttsService.speak(speech, resolveLanguage(language));
        await smsService.sendMessage(
          [
            {
              phoneNumber: intent.contactPhone,
              contactName: intent.contact,
            },
          ],
          intent.messageBody,
          language,
        );
        return speech;
      }

      case 'SOS': {
        const speech = spokenCopy.SOS[language];
        await ttsService.speak(speech, resolveLanguage(language));
        await sosService.trigger({ language });
        return speech;
      }

      case 'READ_MESSAGES': {
        const intro = spokenCopy.READ_MESSAGES[language];
        await ttsService.speak(intro, resolveLanguage(language));
        const summary = await smsService.readRecentMessages(3, language);
        await ttsService.speak(summary, resolveLanguage(language));
        return summary;
      }

      case 'REPLY': {
        if (!intent.messageBody) {
          throw new Error(language === 'hi' ? 'Reply text missing hai.' : 'Reply text is missing.');
        }

        const recipients = await smsService.resolveReplyRecipients(intent.contact);
        if (recipients.length === 0) {
          throw new Error(
            language === 'hi'
              ? 'Reply ke liye koi recent message recipient nahi mila.'
              : 'I could not find a recent message recipient to reply to.',
          );
        }

        const speech = spokenCopy.REPLY[language](recipients[0].contactName ?? recipients[0].phoneNumber);
        await ttsService.speak(speech, resolveLanguage(language));
        await smsService.sendMessage(recipients, intent.messageBody, language);
        return speech;
      }

      default: {
        const fallback = spokenCopy.ERROR[language];
        await ttsService.speak(fallback, resolveLanguage(language));
        return fallback;
      }
    }
  },
};
