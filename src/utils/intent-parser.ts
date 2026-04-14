export type SupportedIntent = 'CALL' | 'TEXT' | 'SOS' | 'READ_MESSAGES' | 'REPLY' | 'UNKNOWN' | 'CHITCHAT';
export type SupportedLanguage = 'hi' | 'en';

export type ParsedIntent = {
  intent: SupportedIntent;
  contact: string | null;
  contactPhone: string | null;
  messageBody: string | null;
  spokenResponse: string;
  needsConfirmation: boolean;
  language: SupportedLanguage;
};

const fallbackIntent: ParsedIntent = {
  intent: 'UNKNOWN',
  contact: null,
  contactPhone: null,
  messageBody: null,
  spokenResponse: 'I did not understand that. Please say it again.',
  needsConfirmation: true,
  language: 'en',
};

export const parseIntentResponse = (input: string): ParsedIntent => {
  const jsonMatch = input.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return fallbackIntent;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    return {
      intent: (parsed.intent as SupportedIntent) ?? fallbackIntent.intent,
      contact: (parsed.contact as string | null) ?? null,
      contactPhone: (parsed.contact_phone as string | null) ?? null,
      messageBody: (parsed.message_body as string | null) ?? null,
      spokenResponse: (parsed.spoken_response as string) ?? fallbackIntent.spokenResponse,
      needsConfirmation: (parsed.needs_confirmation as boolean) ?? true,
      language: (parsed.language as SupportedLanguage) ?? 'en',
    };
  } catch {
    return fallbackIntent;
  }
};

