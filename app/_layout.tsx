import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack>
        {/* The affected app hits this in a native-stack modal (iOS pageSheet);
            not yet isolated whether the modal is required or just makes the
            react-native-screens content-wrapper churn visible in logs. */}
        <Stack.Screen name="repro" options={{ presentation: 'modal', title: 'Repro' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
