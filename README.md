# rns-modal-header-options-remount-repro

Reproduction for a react-native-screens / expo-router bug on **iOS (Fabric)**:
a native-stack **modal** whose header visibility is flipped on from inside the
screen (navigator `headerShown: false` → screen sets `headerShown: true`)
**remounts its screen content on every re-render** in which the
`<Stack.Screen>` `options` prop has a fresh object identity — the idiomatic
inline-options pattern. A focused `TextInput` is destroyed mid-typing: the
keyboard dismisses after the first keystroke and `onBlur` never fires. Android
is unaffected.

Console fingerprint while typing (repeats per keystroke, with an incrementing
Fabric view tag):

```
WARN  Dynamically changing header's visibility in modals will result in remounting the screen and losing all local state.
WARN  Failed to find parent screen controller from <RNSScreenContentWrapper ... tag = N>.
```

## Ingredient matrix (all arms verified on a physical iPhone, iOS 26.6)

| navigator header | screen's inline options | input styling | result |
| --- | --- | --- | --- |
| visible (no flip) | none | conditional NativeWind className | ✅ clean |
| hidden → flipped on in-screen | **per-render identity** | conditional NativeWind className | 🔥 fires |
| hidden → flipped on in-screen | static (module const) | conditional NativeWind className | ✅ clean |
| hidden → flipped on in-screen | **per-render identity** | plain style object | 🔥 fires |
| visible (no flip) | per-render identity | plain style object | ✅ clean |

So the two required ingredients are the **in-modal `headerShown` flip** and the
**per-render options identity**; input styling, ScrollView keyboard props,
CSS-variable themes, and tree size were all verified irrelevant (this repo was
originally scaffolded chasing a NativeWind theory — the matrix exonerated it).

## Run it

```bash
npm install
npx expo start
```

Open on an **iOS** device or simulator with an SDK 57-compatible client (on a
simulator, `npx expo start` + `i` auto-installs a matching Expo Go; the App
Store Expo Go may lag behind the current SDK).

1. Tap **"Open keyboard repro (modal)"**.
2. Tap the field and type **two digits**.
3. **Bug:** the keyboard dismisses after the first digit; the console never
   logs `BLUR fired`. Repeat on Android: typing works normally.
4. In [`app/repro.tsx`](app/repro.tsx), flip `STATIC_HEADER_OPTIONS` to `true`
   (identical header, options identity hoisted to a module constant) — typing
   now works on iOS too.

The entire repro is [`app/repro.tsx`](app/repro.tsx) plus the
`headerShown: false` stack default in [`app/_layout.tsx`](app/_layout.tsx).

Scaffolded from `npx rn-new@latest --nativewind --expo-router`, upgraded to
Expo SDK 57 / react-native 0.86.2 / react-native-screens 4.26.0 to match the
environment the bug was diagnosed in (production app, TestFlight + dev-client).

## Workaround

Hoist or memoize the `options` object passed to `<Stack.Screen>` on any modal
screen that flips `headerShown` — with a stable options identity the remount
never triggers. Alternatively declare `headerShown` at the navigator level so
the screen never changes header visibility.
