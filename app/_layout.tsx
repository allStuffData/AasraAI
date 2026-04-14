import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, NotoSans_400Regular, NotoSans_700Bold } from '@expo-google-fonts/noto-sans';
import * as SystemUI from 'expo-system-ui';
import { ActivityIndicator, View } from 'react-native';

import { initializeDatabase } from '@/db/migrations';
import { useContactsStore } from '@/stores/contacts.store';
import { useSettingsStore } from '@/stores/settings.store';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_700Bold,
  });

  const hydrateContacts = useContactsStore((state) => state.loadContacts);
  const hydrateSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => undefined);

    const bootstrap = async () => {
      await initializeDatabase();
      await Promise.all([hydrateContacts(), hydrateSettings()]);
    };

    void bootstrap();
  }, [hydrateContacts, hydrateSettings]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="conversation" options={{ presentation: 'modal' }} />
        <Stack.Screen name="confirmation" options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
