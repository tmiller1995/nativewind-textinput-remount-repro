import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <SafeAreaProvider>
      {/* Mirrors the affected app: headers are OFF at the stack level, and the
          modal screen itself flips headerShown to true via an inline
          <Stack.Screen> — the "dynamically changing header's visibility in
          modals" pattern react-native-screens warns remounts the screen. */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: true, title: 'Home' }} />
        <Stack.Screen name="repro" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
