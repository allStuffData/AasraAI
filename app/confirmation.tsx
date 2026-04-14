import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { theme } from '@/constants/theme';

const AUTO_TIMEOUT_SECONDS = 10;

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ summary?: string }>();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_TIMEOUT_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          router.back();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const summary = useMemo(() => params.summary ?? 'Do you want me to continue?', [params.summary]);

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Please confirm</Text>
        <Text style={styles.summary}>{summary}</Text>
        <Text style={styles.timeout}>Cancels automatically in {secondsLeft}s</Text>

        <Pressable onPress={() => router.back()} style={[styles.actionButton, styles.yesButton]}>
          <Text style={styles.actionLabel}>Haan / Yes</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={[styles.actionButton, styles.noButton]}>
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
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.text,
    textAlign: 'center',
  },
  summary: {
    marginTop: theme.spacing.lg,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.heading,
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
    minHeight: 84,
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
    fontSize: theme.fontSizes.heading,
    color: theme.colors.surface,
  },
});

