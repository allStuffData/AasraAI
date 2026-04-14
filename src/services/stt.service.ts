import SpeechRecognition from 'expo-speech-recognition';

import { permissionsService } from '@/services/permissions.service';

type STTCallbacks = {
  onPartialResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (message: string) => void;
};

type ListenerHandle = { remove: () => void };

export const sttService = {
  subscribe(callbacks: STTCallbacks): ListenerHandle {
    const partialSub = SpeechRecognition.addListener?.('result', (payload) => {
      const transcript =
        typeof payload.transcript === 'string'
          ? payload.transcript
          : typeof payload.value === 'string'
            ? payload.value
            : '';

      const isFinal = Boolean(payload.isFinal);
      if (isFinal) {
        callbacks.onFinalResult?.(transcript);
      } else {
        callbacks.onPartialResult?.(transcript);
      }
    });

    const errorSub = SpeechRecognition.addListener?.('error', (payload) => {
      const message = typeof payload.message === 'string' ? payload.message : 'Speech recognition failed.';
      callbacks.onError?.(message);
    });

    return {
      remove: () => {
        partialSub?.remove();
        errorSub?.remove();
      },
    };
  },

  async ensurePermissions() {
    return permissionsService.ensureMicrophoneAccess();
  },

  async startListening(language = 'hi-IN') {
    const granted = await this.ensurePermissions();
    if (!granted) {
      throw new Error('Microphone permission is required for voice input.');
    }

    await SpeechRecognition.start({
      lang: language,
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      requiresOnDeviceRecognition: false,
    });
  },

  async stopListening() {
    await SpeechRecognition.stop();
  },

  async cancel() {
    await SpeechRecognition.abort();
  },
};
