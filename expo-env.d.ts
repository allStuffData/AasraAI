/// <reference types="expo-router/types" />

declare module 'expo-speech-recognition' {
  export type SpeechRecognitionResult = {
    transcript?: string;
    isFinal?: boolean;
  };

  export type StartOptions = {
    lang?: string;
    interimResults?: boolean;
    continuous?: boolean;
    maxAlternatives?: number;
    requiresOnDeviceRecognition?: boolean;
  };

  export type Subscription = {
    remove: () => void;
  };

  export type RecognitionModule = {
    start: (options?: StartOptions) => Promise<void> | void;
    stop: () => Promise<void> | void;
    abort: () => Promise<void> | void;
    requestPermissionsAsync?: () => Promise<{ granted: boolean }>;
    getPermissionsAsync?: () => Promise<{ granted: boolean }>;
    addListener?: (
      eventName: string,
      listener: (payload: Record<string, unknown>) => void,
    ) => Subscription;
  };

  const SpeechRecognition: RecognitionModule;
  export default SpeechRecognition;
}

declare module '*.png';

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_ZAI_API_KEY?: string;
  }
}

