import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { theme } from '@/constants/theme';
import { useConversationStore } from '@/stores/conversation.store';
import { actionExecutorService } from '@/services/action-executor.service';
import { ttsService } from '@/services/tts.service';

const AUTO_TIMEOUT_SECONDS = 10;

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ summary?: string }>();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_TIMEOUT_SECONDS);
  const pendingIntent = useConversationStore((state) => state.pendingIntent);
  const setPendingIntent = useConversationStore((state) => state.setPendingIntent);
  const setExecutingAction = useConversationStore((state) => state.setExecutingAction);
  const isExecutingAction = useConversationStore((state) => state.isExecutingAction);
  const setSpokenResponse = useConversationStore((state) => state.setSpokenResponse);
  const appendTurn = useConversationStore((state) => state.appendTurn);
  const endConversation = useConversationStore((state) => state.endConversation);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setPendingIntent(null);
          endConversation();
          router.replace('/');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endConversation, router, setPendingIntent]);

  const summary = useMemo(() => params.summary ?? 'Do you want me to continue?', [params.summary]);

  const cancel = async () => {
    await ttsService.stop();
    setPendingIntent(null);
    setExecutingAction(false);
    endConversation();
    router.replace('/');
  };

  const confirm = async () => {
    if (!pendingIntent) {
      router.replace('/');
      return;
    }

    try {
      setExecutingAction(true);
      const actionMessage = await actionExecutorService.executeIntent(pendingIntent);
      setSpokenResponse(actionMessage);
      appendTurn({
        role: 'assistant',
        content: actionMessage,
        language: pendingIntent.language,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete that action.';
      setSpokenResponse(message);
      await ttsService.speak(message, pendingIntent.language === 'hi' ? 'hi-IN' : 'en-IN');
    } finally {
      setPendingIntent(null);
      setExecutingAction(false);
      endConversation();
      router.replace('/');
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Pushti karein / Please confirm</Text>
        <Text style={styles.summary}>{summary}</Text>
        <Text style={styles.timeout}>10 second mein auto-cancel / Cancels in {secondsLeft}s</Text>

        <Pressable disabled={isExecutingAction} onPress={() => void confirm()} style={[styles.actionButton, styles.yesButton]}>
          {isExecutingAction ? <ActivityIndicator color={theme.colors.surface} size="large" /> : <Text style={styles.actionLabel}>Haan / Yes</Text>}
        </Pressable>

        <Pressable disabled={isExecutingAction} onPress={() => void cancel()} style={[styles.actionButton, styles.noButton]}>
          <Text style={styles.actionLabel}>Nahi / No</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 33, 33, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  sheet: {
    width: '100%',
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.display,
    color: theme.colors.text,
    textAlign: 'center',
  },
  summary: {
    marginTop: theme.spacing.lg,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.display,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 40,
  },
  timeout: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  actionButton: {
    minHeight: 120,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesButton: {
    backgroundColor: theme.colors.success,
  },
  noButton: {
    backgroundColor: theme.colors.sos,
  },
  actionLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.display,
    color: theme.colors.surface,
  },
});
