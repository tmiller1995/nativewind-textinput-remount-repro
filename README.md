# rns-modal-header-options-remount-repro

Repro for a react-native-screens / expo-router bug on iOS (new architecture).

Setup: a native-stack modal, a navigator that defaults to `headerShown: false`,
and a screen that turns its own header on with an inline
`<Stack.Screen options={{ headerShown: true, ... }} />` where the options object
(and its `headerLeft` closure) gets a new identity on every render. That's the
normal inline-options pattern you see in every expo-router example.

With that setup, every React re-render of the screen remounts the screen's
native content. If a TextInput has focus, it gets destroyed mid-typing: the
keyboard closes after the first character and `onBlur` never fires, because the
native view is replaced under a JS component that still thinks it's focused.
Android is fine.

While typing, the console prints this once per keystroke, with a new Fabric
view tag every time:

```
WARN  Dynamically changing header's visibility in modals will result in remounting the screen and losing all local state.
WARN  Failed to find parent screen controller from <RNSScreenContentWrapper ... tag = N>.
```

Note that `headerShown` never actually changes here. It is `true` in every
options object; only the object identity changes.

## What was tested

All five combinations were run on a physical iPhone (iOS 26.6):

| navigator header | screen's inline options | input styling | result |
| --- | --- | --- | --- |
| visible, no flip | none | conditional NativeWind className | works |
| hidden, screen turns it on | new identity per render | conditional NativeWind className | keyboard dies |
| hidden, screen turns it on | static module constant | conditional NativeWind className | works |
| hidden, screen turns it on | new identity per render | plain style object | keyboard dies |
| visible, no flip | new identity per render | plain style object | works |

So the two things that matter are the in-modal header flip and the per-render
options identity. Input styling doesn't matter (this repo started life chasing
a NativeWind theory, which is where the repo name comes from; the matrix ruled
that out), and neither do ScrollView keyboard props, CSS variable themes, or
how big the component tree is.

## Run it

```bash
npm install
npx expo start
```

Open it on iOS with an SDK 57 compatible client. On a simulator, `npx expo
start` plus pressing `i` installs a matching Expo Go for you. On a physical
device use any SDK 57 development build, since the App Store Expo Go can lag
behind the current SDK.

1. Tap "Open keyboard repro (modal)".
2. Tap the field and type two digits.
3. On iOS the keyboard closes after the first digit and the console never logs
   `BLUR fired`. On Android typing works normally.
4. In [`app/repro.tsx`](app/repro.tsx), set `STATIC_HEADER_OPTIONS` to `true`.
   The header looks identical, but the options object is hoisted to a module
   constant, and typing works on iOS too.

The whole repro is [`app/repro.tsx`](app/repro.tsx) plus the
`headerShown: false` stack default in [`app/_layout.tsx`](app/_layout.tsx).

Scaffolded from `npx rn-new@latest --nativewind --expo-router`, then upgraded
to Expo SDK 57 / react-native 0.86.2 / react-native-screens 4.26.0 to match the
production app where this was first hit (TestFlight and dev-client builds).

## Workaround

Hoist or memoize the options object you pass to `<Stack.Screen>` on any modal
screen that turns its own header on. With a stable options identity the remount
never happens. Declaring `headerShown` at the navigator level instead of
flipping it from inside the screen also avoids it.
