import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

/**
 * Repro for: conditional template-literal className on a TextInput remounts the
 * native input on every parent re-render (iOS / Fabric) — the focused keyboard
 * dismisses after the first keystroke, with NO onBlur fired.
 *
 * Flip USE_STYLE_OBJECT to true (identical visuals via a plain style object)
 * and the bug disappears — same component, same re-renders.
 */
const USE_STYLE_OBJECT = false; // ← flip to true: bug disappears

export default function RemountRepro() {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const borderClass = focused ? 'border-2 border-teal-500' : 'border border-gray-400';
  const borderStyle = focused
    ? { borderWidth: 2, borderColor: '#0d9488' }
    : { borderWidth: 1, borderColor: '#9ca3af' };

  return (
    <ScrollView className="flex-1 bg-white p-6" keyboardShouldPersistTaps="handled">
      <Text className="mb-1 text-base font-semibold">
        Mode: {USE_STYLE_OBJECT ? 'style object (works)' : 'conditional className (bug)'}
      </Text>
      <Text className="mb-4 text-base">
        Tap the field and type two digits. On iOS the keyboard dies after the first digit —
        and the console never logs BLUR. Android is fine either way.
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          console.log('BLUR fired'); // never logs when the bug kills the keyboard
        }}
        keyboardType="number-pad"
        placeholder="type here"
        className={
          USE_STYLE_OBJECT
            ? 'min-h-[48px] rounded-xl px-4'
            : `min-h-[48px] rounded-xl px-4 ${borderClass}`
        }
        style={USE_STYLE_OBJECT ? borderStyle : undefined}
      />
      <Text className="mt-4 text-sm text-gray-500">Typed so far: “{value}”</Text>
      <View className="h-96" />
    </ScrollView>
  );
}
