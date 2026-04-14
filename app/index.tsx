import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { useContactsStore } from '@/stores/contacts.store';
import { useConversationStore } from '@/stores/conversation.store';
import { ttsService } from '@/services/tts.service';
import { callService } from '@/services/call.service';

const formatClock = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

export default function HomeScreen() {
  const router = useRouter();
  const favoriteContacts = useContactsStore((state) => state.favoriteContacts);
  const beginConversation = useConversationStore((state) => state.beginConversation);

  const statusTime = useMemo(() => formatClock(new Date()), []);

  const handleTalk = async () => {
    beginConversation();
    await ttsService.stop();
    router.push('/conversation');
  };

  const handleQuickCall = async (contactId: string) => {
    const contact = useContactsStore.getState().contacts.find((entry) => entry.id === contactId);

    if (!contact) {
      return;
    }

    Alert.alert('Calling contact', `Opening dialer for ${contact.displayName}.`);
    await callService.startCall(contact.primaryPhone);
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{statusTime}</Text>
        <Text style={styles.statusText}>Network Ready</Text>
        <Text style={styles.statusText}>Voice Online</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCopy}>
          <Text style={styles.heading}>Aasra</Text>
          <Text style={styles.subheading}>Bolo, aur ho jaayega.</Text>
        </View>

        <Pressable
          accessibilityHint="Starts listening for your voice command."
          accessibilityLabel="Talk to Aasra"
          onPress={() => void handleTalk()}
          style={({ pressed }) => [styles.talkButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="keyboard-voice" size={80} color={theme.colors.surface} />
          <Text style={styles.talkButtonTitle}>Talk to Aasra</Text>
          <Text style={styles.talkButtonSubtitle}>Tap once and speak clearly</Text>
        </Pressable>

        <View style={styles.favoritesSection}>
          <Text style={styles.sectionTitle}>Favorite Contacts</Text>
          <View style={styles.favoritesGrid}>
            {favoriteContacts.length > 0 ? (
              favoriteContacts.map((contact) => (
                <Pressable
                  key={contact.id}
                  accessibilityLabel={`Call ${contact.displayName}`}
                  onPress={() => void handleQuickCall(contact.id)}
                  style={({ pressed }) => [styles.favoriteCard, pressed && styles.pressed]}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{contact.displayName.slice(0, 1)}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.favoriteName}>
                    {contact.displayName}
                  </Text>
                  <Text numberOfLines={1} style={styles.favoriteRelation}>
                    {contact.relationship || 'Contact'}
                  </Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateTitle}>No favorites yet</Text>
                <Text style={styles.emptyStateText}>Open Settings to add contacts and mark favorites for quick calling.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Pressable
        accessibilityHint="Opens SOS setup and emergency actions."
        accessibilityLabel="SOS"
        onPress={() => router.push('/settings/sos')}
        style={({ pressed }) => [styles.sosButton, pressed && styles.sosPressed]}
      >
        <MaterialIcons name="warning" size={34} color={theme.colors.surface} />
        <Text style={styles.sosLabel}>SOS</Text>
      </Pressable>

      <Pressable
        accessibilityLabel="Settings"
        onPress={() => router.push('/settings')}
        style={({ pressed }) => [styles.settingsShortcut, pressed && styles.pressed]}
      >
        <MaterialIcons name="settings" size={28} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statusText: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.text,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl * 2,
  },
  heroCopy: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  heading: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.display,
    color: theme.colors.text,
  },
  subheading: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  talkButton: {
    minHeight: 220,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  talkButtonTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.surface,
    textAlign: 'center',
  },
  talkButtonSubtitle: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.surfaceMuted,
    textAlign: 'center',
  },
  favoritesSection: {
    marginTop: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.text,
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  favoriteCard: {
    width: '47%',
    minHeight: 164,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  emptyStateCard: {
    width: '100%',
    minHeight: 148,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.text,
  },
  emptyStateText: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textMuted,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.primary,
  },
  favoriteName: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.body,
    color: theme.colors.text,
    textAlign: 'center',
  },
  favoriteRelation: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  sosButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xl,
    minWidth: 120,
    minHeight: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.sos,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: theme.colors.sos,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 10,
  },
  sosLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.body,
    color: theme.colors.surface,
  },
  sosPressed: {
    transform: [{ scale: 0.98 }],
  },
  settingsShortcut: {
    position: 'absolute',
    top: theme.spacing.xxl,
    right: theme.spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
