import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { useContactsStore } from '@/stores/contacts.store';

export default function ContactsSettingsScreen() {
  const contacts = useContactsStore((state) => state.contacts);
  const addContact = useContactsStore((state) => state.addContact);
  const removeContact = useContactsStore((state) => state.deleteContact);
  const importDeviceContacts = useContactsStore((state) => state.importFromDeviceContacts);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [alias, setAlias] = useState('');

  const saveContact = async () => {
    if (!name || !phone) {
      return;
    }

    await addContact({
      displayName: name,
      primaryPhone: phone,
      relationship,
      aliases: alias ? alias.split(',').map((value) => value.trim()).filter(Boolean) : [],
      isFavorite: contacts.length < 6,
      isSos: false,
    });

    setName('');
    setPhone('');
    setRelationship('');
    setAlias('');
  };

  const importFromPhone = async () => {
    const result = await importDeviceContacts();
    Alert.alert('Contacts imported', `Added ${result.addedCount} contacts from the phone.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Contacts</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Add contact</Text>
        <TextInput onChangeText={setName} placeholder="Name" placeholderTextColor={theme.colors.textMuted} style={styles.input} value={name} />
        <TextInput onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={theme.colors.textMuted} style={styles.input} value={phone} />
        <TextInput onChangeText={setRelationship} placeholder="Relationship" placeholderTextColor={theme.colors.textMuted} style={styles.input} value={relationship} />
        <TextInput
          onChangeText={setAlias}
          placeholder="Aliases: Beta, Son, Raju"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={alias}
        />
        <Pressable onPress={() => void saveContact()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonLabel}>Save Contact</Text>
        </Pressable>
        <Pressable onPress={() => void importFromPhone()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonLabel}>Import from Phone</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactCopy}>
              <Text style={styles.contactName}>{contact.displayName}</Text>
              <Text style={styles.contactMeta}>{contact.primaryPhone}</Text>
              <Text style={styles.contactMeta}>
                {contact.relationship || 'No relationship'} {contact.aliases.length ? `• ${contact.aliases.join(', ')}` : ''}
              </Text>
            </View>
            <Pressable onPress={() => void removeContact(contact.id)} style={styles.iconButton}>
              <MaterialIcons name="delete" size={28} color={theme.colors.sos} />
            </Pressable>
          </View>
        ))}
      </View>
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
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.display,
    color: theme.colors.text,
  },
  formCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  label: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.heading,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    minHeight: 72,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  primaryButton: {
    minHeight: 76,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  primaryButtonLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.surface,
  },
  secondaryButton: {
    minHeight: 76,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  secondaryButtonLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.primary,
  },
  list: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  contactCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    minHeight: 112,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactCopy: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  contactName: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.text,
  },
  contactMeta: {
    marginTop: 4,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    color: theme.colors.textMuted,
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.sosSoft,
  },
});

