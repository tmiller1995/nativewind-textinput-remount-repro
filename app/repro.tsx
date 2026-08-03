import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

/**
 * On iOS (new architecture), a native-stack modal that turns its own header on
 * (the navigator defaults to headerShown: false, this screen sets it to true)
 * remounts its native content on every re-render where the <Stack.Screen>
 * options prop has a new object identity. That's the normal inline-options
 * pattern. A focused TextInput gets destroyed mid-typing: the keyboard closes
 * after the first character and onBlur never fires. Android is unaffected.
 *
 * The console prints this once per keystroke, with an incrementing view tag:
 *
 *   WARN  Dynamically changing header's visibility in modals will result in
 *         remounting the screen and losing all local state.
 *   WARN  Failed to find parent screen controller from
 *         <RNSScreenContentWrapper ... tag = N>.
 *
 * Set STATIC_HEADER_OPTIONS to true (same header, options hoisted to a module
 * constant) and the problem goes away.
 *
 * Both of these were required to reproduce; removing either one fixes it:
 *   - presentation: 'modal' with headerShown: false at the navigator and the
 *     screen turning the header on itself (declaring headerShown: true at the
 *     navigator level instead: no repro)
 *   - a new options object identity per render (static or memoized: no repro)
 * Ruled out: how the TextInput is styled (NativeWind conditional classNames
 * and plain style objects behave the same), ScrollView keyboard props, CSS
 * variable themes, tree size.
 */
const STATIC_HEADER_OPTIONS = false; // set to true and the bug goes away

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
          Header options: {STATIC_HEADER_OPTIONS ? 'static (works)' : 'new identity per render (bug)'}
        </Text>
        <Text className="mb-4 text-base">
          Tap the field and type two digits. On iOS the keyboard closes after the first digit and
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
            placeholder="0"
            className="min-h-[48px] rounded-xl border border-gray-400 bg-white px-4 text-base"
            style={focused ? { borderWidth: 2, borderColor: '#0d9488' } : undefined}
          />
        </View>
        <Text className="mt-4 text-sm">Typed so far: {value || '(nothing yet)'}</Text>
        <View className="h-96" />
      </ScrollView>
    </View>
  );
}
