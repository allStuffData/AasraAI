import { create } from 'zustand';

import { database } from '@/db/migrations';
import type { ParsedIntent } from '@/utils/intent-parser';

type ChatTurn = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: 'hi' | 'en';
  createdAt: string;
};

type ConversationState = {
  isActive: boolean;
  liveTranscript: string;
  spokenResponse: string;
  history: ChatTurn[];
  lastIntent: ParsedIntent | null;
  pendingIntent: ParsedIntent | null;
  isExecutingAction: boolean;
  inactivityTimer: ReturnType<typeof setTimeout> | null;
  beginConversation: () => void;
  endConversation: () => void;
  setLiveTranscript: (value: string) => void;
  setSpokenResponse: (value: string) => void;
  appendTurn: (turn: Omit<ChatTurn, 'id' | 'createdAt'>) => void;
  setLastIntent: (intent: ParsedIntent | null) => void;
  setPendingIntent: (intent: ParsedIntent | null) => void;
  setExecutingAction: (value: boolean) => void;
  resetContext: () => void;
  restartInactivityTimer: () => void;
};

const INACTIVITY_MS = 5 * 60 * 1000;

const persistTurn = (turn: ChatTurn) => {
  database.runSync(
    'INSERT INTO chat_history (id, role, content, language, created_at) VALUES (?, ?, ?, ?, ?)',
    [turn.id, turn.role, turn.content, turn.language, turn.createdAt],
  );

  const staleRows = database.getAllSync<{ id: string }>(
    `SELECT id FROM chat_history ORDER BY created_at DESC LIMIT -1 OFFSET 10`,
  );

  staleRows.forEach((row) => {
    database.runSync('DELETE FROM chat_history WHERE id = ?', [row.id]);
  });
};

export const useConversationStore = create<ConversationState>((set, get) => ({
  isActive: false,
  liveTranscript: '',
  spokenResponse: '',
  history: [],
  lastIntent: null,
  pendingIntent: null,
  isExecutingAction: false,
  inactivityTimer: null,
  beginConversation: () => {
    set({ isActive: true });
    get().restartInactivityTimer();
  },
  endConversation: () => {
    const timer = get().inactivityTimer;
    if (timer) {
      clearTimeout(timer);
    }

    set({
      isActive: false,
      liveTranscript: '',
      spokenResponse: '',
      inactivityTimer: null,
    });
  },
  setLiveTranscript: (value) => {
    set({ liveTranscript: value });
    get().restartInactivityTimer();
  },
  setSpokenResponse: (value) => {
    set({ spokenResponse: value });
    get().restartInactivityTimer();
  },
  appendTurn: (turn) => {
    const completeTurn: ChatTurn = {
      ...turn,
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    persistTurn(completeTurn);

    set((state) => ({
      history: [...state.history, completeTurn].slice(-10),
    }));
  },
  setLastIntent: (intent) => set({ lastIntent: intent }),
  setPendingIntent: (intent) => set({ pendingIntent: intent }),
  setExecutingAction: (value) => set({ isExecutingAction: value }),
  resetContext: () => {
    const timer = get().inactivityTimer;
    if (timer) {
      clearTimeout(timer);
    }

    database.runSync('DELETE FROM chat_history');
    set({
      history: [],
      liveTranscript: '',
      spokenResponse: '',
      lastIntent: null,
      pendingIntent: null,
      isExecutingAction: false,
      inactivityTimer: null,
      isActive: false,
    });
  },
  restartInactivityTimer: () => {
    const oldTimer = get().inactivityTimer;
    if (oldTimer) {
      clearTimeout(oldTimer);
    }

    const timer = setTimeout(() => {
      get().resetContext();
    }, INACTIVITY_MS);

    set({ inactivityTimer: timer });
  },
}));
