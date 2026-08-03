import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

/**
 * Repro: on iOS (Fabric), a native-stack MODAL whose header visibility is
 * flipped on from inside the screen (navigator default headerShown:false →
 * screen sets headerShown:true) REMOUNTS its screen content on every re-render
 * for which the <Stack.Screen> options prop has a fresh object identity — the
 * idiomatic inline-options pattern. A focused TextInput is destroyed
 * mid-typing: the keyboard dismisses after the first keystroke and onBlur
 * NEVER fires. Android is unaffected.
 *
 * Console fingerprint while typing (per keystroke):
 *   WARN  Dynamically changing header's visibility in modals will result in
 *         remounting the screen and losing all local state.
 *   WARN  Failed to find parent screen controller from
 *         <RNSScreenContentWrapper ... tag = N>.   ← tag increments every time
 *
 * Flip STATIC_HEADER_OPTIONS to true (identical header, options identity
 * hoisted to a module constant) and the bug disappears.
 *
 * Ingredients verified required (each removed independently → no repro):
 *   - presentation: 'modal' with the navigator-level headerShown:false and the
 *     in-screen flip to true (declaring headerShown:true at the navigator
 *     level instead → no repro)
 *   - fresh options object identity per render (static/memoized → no repro)
 * Verified irrelevant: how the TextInput is styled (NativeWind conditional
 * className vs plain style objects — both arms behave identically), ScrollView
 * keyboard props, CSS-variable themes, tree size.
 */
const STATIC_HEADER_OPTIONS = false; // ← flip to true: bug disappears

const HEADER_OPTIONS = { headerShown: true, title: 'Log play' };

export default function RemountRepro() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <View className="flex-1 bg-white">
      {STATIC_HEADER_OPTIONS ? (
        <Stack.Screen options={HEADER_OPTIONS} />
      ) : (
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Log play',
            headerLeft: () => (
              <Pressable onPress={() => router.back()} hitSlop={10}>
                <Text className="text-base text-teal-700">Cancel</Text>
              </Pressable>
            ),
          }}
        />
      )}
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="grow px-4 pb-10 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-1 text-base font-semibold">
          Header options: {STATIC_HEADER_OPTIONS ? 'static (works)' : 'per-render identity (bug)'}
        </Text>
        <Text className="mb-4 text-base">
          Tap the field and type two digits. On iOS the keyboard dies after the first digit — and
          the console never logs BLUR. Android is fine either way.
        </Text>
        <View className="w-32">
          <Text className="mb-1 text-sm">Score</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              console.log('BLUR fired'); // never logs when the bug kills the keyboard
            }}
            keyboardType="number-pad"
            placeholder="—"
            className="min-h-[48px] rounded-xl border border-gray-400 bg-white px-4 text-base"
            style={focused ? { borderWidth: 2, borderColor: '#0d9488' } : undefined}
          />
        </View>
        <Text className="mt-4 text-sm">Typed so far: “{value}”</Text>
        <View className="h-96" />
      </ScrollView>
    </View>
  );
}
