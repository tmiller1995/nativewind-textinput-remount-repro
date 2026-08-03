import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

/**
 * Repro for: conditional template-literal className on a TextInput remounts the
 * native input on parent re-render (iOS / Fabric) — the focused keyboard
 * dismisses after the first keystroke, with NO onBlur fired.
 *
 * This mirrors the affected app's real composition: a text-field component
 * (wrapper View + label + TextInput) whose conditional classes resolve through
 * CSS-variable-backed semantic colors (see global.css + tailwind.config.js),
 * inside a ScrollView with keyboard-handling props, presented as a modal.
 *
 * Flip USE_STYLE_OBJECT to true (identical conditional styling via a plain
 * style object) and the bug disappears — same component, same re-renders.
 */
const USE_STYLE_OBJECT = false; // ← flip to true: bug disappears

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  // Mirrors the affected app's field component, which resolves a few colors via
  // NativeWind's useColorScheme on every render (placeholder tint etc.).
  const { colorScheme } = useColorScheme();
  const placeholderColor = colorScheme === 'dark' ? '#948dae' : '#6b6e81';

  const borderClass = focused ? 'border-2 border-teal-500' : 'border border-border-control';
  const borderStyle = focused
    ? { borderWidth: 2, borderColor: '#0d9488' }
    : { borderWidth: 1, borderColor: '#878a9d' };

  return (
    <View className="w-32">
      <Text className="mb-1 text-sm text-text-primary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          console.log('BLUR fired'); // never logs when the bug kills the keyboard
        }}
        keyboardType="number-pad"
        placeholder="—"
        placeholderTextColor={placeholderColor}
        className={
          USE_STYLE_OBJECT
            ? 'min-h-[48px] rounded-xl bg-surface px-4 text-base text-text-primary'
            : `min-h-[48px] rounded-xl bg-surface px-4 text-base text-text-primary ${borderClass}`
        }
        style={USE_STYLE_OBJECT ? borderStyle : undefined}
      />
    </View>
  );
}

export default function RemountRepro() {
  const router = useRouter();
  const [value, setValue] = useState('');

  return (
    <View className="flex-1 bg-surface">
      {/* Mirrors the affected app: the modal flips headerShown to true from
          INSIDE the screen, and the options object + headerLeft closure are
          recreated on every render (so every keystroke). */}
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
      <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="grow px-4 pb-10 pt-2"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <Text className="mb-1 text-base font-semibold text-text-primary">
        Mode: {USE_STYLE_OBJECT ? 'style object (works)' : 'conditional className (bug)'}
      </Text>
      <Text className="mb-4 text-base text-text-primary">
        Tap the field and type two digits. On iOS the keyboard dies after the first digit — and
        the console never logs BLUR. Android is fine either way.
      </Text>
      <Field label="Score" value={value} onChangeText={setValue} />
      <Text className="mt-4 text-sm text-text-primary">Typed so far: “{value}”</Text>
      {/* Bulk: the affected form re-renders dozens of interop-styled rows on
          every keystroke; simulate that load. */}
      {Array.from({ length: 40 }, (_, i) => (
        <View
          key={i}
          className={`mt-2 min-h-[44px] flex-row items-center rounded-xl bg-surface px-4 ${
            i % 2 === 0 ? 'border border-border-control' : 'border border-teal-500'
          }`}
        >
          <Text className="text-sm text-text-primary">
            Row {i} — typed {value.length} digit{value.length === 1 ? '' : 's'}
          </Text>
        </View>
      ))}
      <View className="h-96" />
      </ScrollView>
    </View>
  );
}
