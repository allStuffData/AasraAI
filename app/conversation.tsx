import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { useConversationStore } from '@/stores/conversation.store';
import { sttService } from '@/services/stt.service';
import { ttsService } from '@/services/tts.service';
import { llmService } from '@/services/llm.service';
import { contactsService } from '@/services/contacts.service';
import { networkService } from '@/services/network.service';

function useWaveAnimation() {
  const values = useRef([new Animated.Value(0.55), new Animated.Value(0.75), new Animated.Value(0.4)]).current;

  useEffect(() => {
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 550 + index * 120,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 550 + index * 120,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [values]);

  return values;
}

export default function ConversationScreen() {
  const router = useRouter();
  const transcript = useConversationStore((state) => state.liveTranscript);
  const response = useConversationStore((state) => state.spokenResponse);
  const setTranscript = useConversationStore((state) => state.setLiveTranscript);
  const setResponse = useConversationStore((state) => state.setSpokenResponse);
  const endConversation = useConversationStore((state) => state.endConversation);
  const appendTurn = useConversationStore((state) => state.appendTurn);
  const setLastIntent = useConversationStore((state) => state.setLastIntent);
  const setPendingIntent = useConversationStore((state) => state.setPendingIntent);
  const waveValues = useWaveAnimation();
  const isProcessing = useRef(false);

  useEffect(() => {
    const subscription = sttService.subscribe({
      onPartialResult: (value) => setTranscript(value),
      onFinalResult: async (value) => {
        if (isProcessing.current) {
          return;
        }

        isProcessing.current = true;
        setTranscript(value);

        appendTurn({
          role: 'user',
          content: value,
          language: /[ऀ-ॿ]/.test(value) ? 'hi' : 'en',
        });

        setResponse('');

        try {
          const isOnline = await networkService.hasInternetConnection();
          if (!isOnline) {
            const offlineMessage = networkService.getOfflineMessage('en');
            setResponse(offlineMessage);
            await ttsService.speak(offlineMessage, 'en-IN');
            return;
          }

          let streamedResponse = '';
          const intent = await llmService.streamIntent(
            value,
            useConversationStore.getState().history.map((turn) => ({ role: turn.role, content: turn.content })),
            {
              onToken: (token) => {
                streamedResponse += token;
                setResponse(streamedResponse);
              },
            },
          );

          let resolvedPhone: string | null = null;
          if (intent.contact) {
            const matches = await contactsService.fuzzyFind(intent.contact);
            resolvedPhone = matches[0]?.contact.primaryPhone ?? null;
          }

          const resolvedIntent = {
            ...intent,
            contactPhone: resolvedPhone,
          };

          setLastIntent(resolvedIntent);
          setPendingIntent(resolvedIntent.needsConfirmation ? resolvedIntent : null);
          appendTurn({
            role: 'assistant',
            content: resolvedIntent.spokenResponse,
            language: resolvedIntent.language,
          });
          setResponse(resolvedIntent.spokenResponse);
          await ttsService.speak(
            resolvedIntent.spokenResponse,
            resolvedIntent.language === 'hi' ? 'hi-IN' : 'en-IN',
          );

          if (resolvedIntent.needsConfirmation) {
            router.replace({
              pathname: '/confirmation',
              params: {
                summary: resolvedIntent.spokenResponse,
              },
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to process your request right now.';
          setResponse(message);
          await ttsService.speak(message);
        } finally {
          isProcessing.current = false;
        }
      },
      onError: (error) => {
        setResponse(error);
      },
    });

    void sttService.startListening().catch(async (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Microphone permission is required to start listening.';
      setResponse(message);
      await ttsService.speak(message);
    });

    return () => {
      subscription.remove();
      void sttService.stopListening();
      void ttsService.stop();
    };
  }, [appendTurn, router, setLastIntent, setPendingIntent, setResponse, setTranscript]);

  const bars = useMemo(
    () =>
      waveValues.map((value, index) => (
        <Animated.View
          key={`wave-${index}`}
          style={[
            styles.waveBar,
            {
              transform: [
                {
                  scaleY: value,
                },
              ],
            },
          ]}
        />
      )),
    [waveValues],
  );

  const cancel = async () => {
    await sttService.stopListening();
    await ttsService.stop();
    endConversation();
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listening</Text>
      <Text style={styles.subtitle}>Speak slowly. Aasra will confirm before acting.</Text>

      <View style={styles.waveShell}>{bars}</View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>You said</Text>
        <Text style={styles.cardText}>{transcript || 'Waiting for your voice...'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Aasra says</Text>
        <Text style={styles.cardText}>{response || 'I am ready to help.'}</Text>
      </View>

      <Pressable accessibilityLabel="Stop listening" onPress={() => void cancel()} style={styles.cancelButton}>
        <MaterialIcons name="close" size={36} color={theme.colors.surface} />
        <Text style={styles.cancelLabel}>Ruko / Stop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.display,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  waveShell: {
    marginTop: theme.spacing.xxxl,
    minHeight: 180,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  waveBar: {
    width: 26,
    height: 120,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  card: {
    marginTop: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    minHeight: 140,
  },
  cardLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.textMuted,
  },
  cardText: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.text,
    lineHeight: 42,
  },
  cancelButton: {
    marginTop: 'auto',
    minHeight: 84,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.sos,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cancelLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.surface,
  },
});
