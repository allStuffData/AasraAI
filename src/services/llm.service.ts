import { LLM_CONFIG, buildSystemPrompt } from '@/constants/prompts';
import { contactsService } from '@/services/contacts.service';
import { parseIntentResponse, type ParsedIntent } from '@/utils/intent-parser';
import { settingsStore } from '@/stores/settings.store';

export type ConversationMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type StreamHandlers = {
  onToken?: (token: string) => void;
};

const extractTokenFromLine = (line: string) => {
  if (!line.startsWith('data:')) {
    return '';
  }

  const value = line.slice(5).trim();
  if (!value || value === '[DONE]') {
    return '';
  }

  try {
    const parsed = JSON.parse(value) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };

    return parsed.choices?.[0]?.delta?.content ?? '';
  } catch {
    return '';
  }
};

export const llmService = {
  async buildMessages(userPrompt: string, history: ConversationMessage[]) {
    const contacts = await contactsService.listContacts();
    const systemPrompt = buildSystemPrompt(contacts);

    return [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10),
      { role: 'user', content: userPrompt },
    ] satisfies ConversationMessage[];
  },

  async streamIntent(userPrompt: string, history: ConversationMessage[], handlers?: StreamHandlers): Promise<ParsedIntent> {
    const apiKey = settingsStore.getState().apiKey || process.env.EXPO_PUBLIC_ZAI_API_KEY || '';
    if (!apiKey) {
      throw new Error('Z.AI API key is missing. Add it in Settings or .env.');
    }

    const messages = await this.buildMessages(userPrompt, history);
    const response = await fetch(LLM_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: LLM_CONFIG.model,
        messages,
        temperature: LLM_CONFIG.temperature,
        max_tokens: LLM_CONFIG.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`LLM request failed with status ${response.status}.`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const token = extractTokenFromLine(line);
        if (!token) {
          continue;
        }

        fullText += token;
        handlers?.onToken?.(token);
      }
    }

    return parseIntentResponse(fullText);
  },
};

