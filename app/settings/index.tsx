import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';

import { theme } from '@/constants/theme';
import { useSettingsStore } from '@/stores/settings.store';

export default function SettingsHubScreen() {
  const configuredPin = useSettingsStore((state) => state.caregiverPin);
  const languagePreference = useSettingsStore((state) => state.languagePreference);
  const ttsRate = useSettingsStore((state) => state.ttsRate);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const setLanguagePreference = useSettingsStore((state) => state.setLanguagePreference);
  const setTtsRate = useSettingsStore((state) => state.setTtsRate);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const [inputPin, setInputPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [draftApiKey, setDraftApiKey] = useState(apiKey);

  const verifyPin = () => {
    if (inputPin === configuredPin) {
      setUnlocked(true);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Caregiver Settings</Text>
      <Text style={styles.subtitle}>Protected by a 4-digit PIN before changes can be made.</Text>

      {!unlocked ? (
        <View style={styles.lockCard}>
          <Text style={styles.label}>Enter PIN</Text>
          <TextInput
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={setInputPin}
            placeholder="1234"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={styles.input}
            value={inputPin}
          />
          <Pressable onPress={verifyPin} style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>Unlock Settings</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.menu}>
          <Link asChild href="/settings/contacts">
            <Pressable style={styles.menuCard}>
              <Text style={styles.menuTitle}>Manage Contacts</Text>
              <Text style={styles.menuDescription}>Add, edit, delete, import, and favorite contacts.</Text>
            </Pressable>
          </Link>

          <Link asChild href="/settings/sos">
            <Pressable style={styles.menuCard}>
              <Text style={styles.menuTitle}>SOS Configuration</Text>
              <Text style={styles.menuDescription}>Choose emergency contacts and the primary responder.</Text>
            </Pressable>
          </Link>

          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Voice Preferences</Text>
            <Text style={styles.menuDescription}>Language: {languagePreference}</Text>
            <Text style={styles.menuDescription}>Voice speed: {ttsRate.toFixed(2)}</Text>
            <View style={styles.row}>
              {(['auto', 'hi', 'en'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => void setLanguagePreference(option)}
                  style={[styles.smallChoice, languagePreference === option && styles.smallChoiceActive]}
                >
                  <Text style={[styles.smallChoiceLabel, languagePreference === option && styles.smallChoiceLabelActive]}>
                    {option.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.row}>
              {[0.8, 0.95, 1.05].map((option) => (
                <Pressable
                  key={option}
                  onPress={() => void setTtsRate(option)}
                  style={[styles.smallChoice, ttsRate === option && styles.smallChoiceActive]}
                >
                  <Text style={[styles.smallChoiceLabel, ttsRate === option && styles.smallChoiceLabelActive]}>
                    {option.toFixed(2)}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Z.AI API Key</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setDraftApiKey}
              placeholder="Paste API key"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              value={draftApiKey}
            />
            <Pressable onPress={() => void setApiKey(draftApiKey.trim())} style={styles.primaryButton}>
              <Text style={styles.primaryButtonLabel}>Save API Key</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  title: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.display,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textMuted,
  },
  lockCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
  label: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.text,
  },
  input: {
    marginTop: theme.spacing.md,
    minHeight: 72,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.text,
  },
  primaryButton: {
    marginTop: theme.spacing.lg,
    minHeight: 76,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.surface,
  },
  menu: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  menuCard: {
    minHeight: 130,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  menuTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.text,
  },
  menuDescription: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textMuted,
  },
  smallChoice: {
    minWidth: 88,
    minHeight: 64,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  smallChoiceActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  smallChoiceLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.body,
    color: theme.colors.text,
  },
  smallChoiceLabelActive: {
    color: theme.colors.primary,
  },
  inputField: {
    marginTop: theme.spacing.md,
    minHeight: 72,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.text,
  },
});
