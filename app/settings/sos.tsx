import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { useContactsStore } from '@/stores/contacts.store';
import { useSettingsStore } from '@/stores/settings.store';

export default function SosSettingsScreen() {
  const contacts = useContactsStore((state) => state.contacts);
  const primarySosContactId = useSettingsStore((state) => state.primarySosContactId);
  const setPrimarySosContact = useSettingsStore((state) => state.setPrimarySosContact);
  const toggleContactSos = useContactsStore((state) => state.toggleSos);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>SOS Configuration</Text>
      <Text style={styles.subtitle}>Choose up to 5 contacts who should receive emergency alerts.</Text>

      {contacts.map((contact) => {
        const isPrimary = primarySosContactId === contact.id;

        return (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactCopy}>
              <Text style={styles.contactName}>{contact.displayName}</Text>
              <Text style={styles.contactMeta}>{contact.primaryPhone}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => void toggleContactSos(contact.id)}
                style={[styles.actionChip, contact.isSos && styles.actionChipActive]}
              >
                <Text style={[styles.actionChipLabel, contact.isSos && styles.actionChipLabelActive]}>
                  {contact.isSos ? 'Included' : 'Add to SOS'}
                </Text>
              </Pressable>

              <Pressable
                disabled={!contact.isSos}
                onPress={() => void setPrimarySosContact(contact.id)}
                style={[styles.actionChip, isPrimary && styles.primaryChip, !contact.isSos && styles.actionChipDisabled]}
              >
                <Text style={[styles.actionChipLabel, isPrimary && styles.primaryChipLabel]}>
                  {isPrimary ? 'Primary' : 'Make Primary'}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
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
    paddingBottom: theme.spacing.xxxl,
  },
  title: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.display,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textMuted,
  },
  contactCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  contactCopy: {
    marginBottom: theme.spacing.md,
  },
  contactName: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.text,
  },
  contactMeta: {
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textMuted,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  actionChip: {
    minHeight: 64,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  actionChipActive: {
    borderColor: theme.colors.sos,
    backgroundColor: theme.colors.sosSoft,
  },
  actionChipDisabled: {
    opacity: 0.4,
  },
  actionChipLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.body,
    color: theme.colors.text,
  },
  actionChipLabelActive: {
    color: theme.colors.sos,
  },
  primaryChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  primaryChipLabel: {
    color: theme.colors.primary,
  },
});

