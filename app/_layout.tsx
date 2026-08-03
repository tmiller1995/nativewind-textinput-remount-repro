import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <SafeAreaProvider>
      {/* Headers are off at the stack level, and the modal screen turns its
          own header on with an inline <Stack.Screen>. Both halves of that
          arrangement are required to reproduce the bug. */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: true, title: 'Home' }} />
        <Stack.Screen name="repro" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
