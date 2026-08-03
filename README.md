# nativewind-textinput-remount-repro

Reproduction for a NativeWind v4 bug on iOS / Fabric: **a conditional
template-literal `className` on a `TextInput` remounts the native input on every
parent re-render** — a focused input is torn down mid-typing, the keyboard
dismisses after the first keystroke, and `onBlur` never fires. Android is
unaffected, and expressing the same conditional styling as a plain `style`
object fixes it.

Scaffolded from the NativeWind contributing guide's template
(`npx rn-new@latest --nativewind --expo-router`), then upgraded to
Expo SDK 57 / react-native 0.86.2 / nativewind 4.2.6 to match the environment
the bug was diagnosed in (physical iPhone, iOS 26.6, TestFlight + dev-client).

## Run it

```bash
npm install
npx expo start
```

Open on an **iOS** device or simulator with an **SDK 57-compatible client**:
on a simulator/emulator, `npx expo start` + pressing `i`/`a` auto-installs a
matching Expo Go build; on a physical device, use any SDK 57 development build
(the App Store Expo Go may lag behind the current SDK). No custom native code
is required.

1. Tap **"Open keyboard repro (modal)"**.
2. Tap the text field and type **two digits**.
3. **Bug:** the keyboard dismisses after the first digit; the console never logs
   `BLUR fired`. Repeat on Android: typing works normally.
4. In [`app/repro.tsx`](app/repro.tsx), flip `USE_STYLE_OBJECT` to `true`
   (identical visuals via a `style` object) and repeat — typing now works on
   iOS too.

The entire repro is [`app/repro.tsx`](app/repro.tsx); the modal registration is
in [`app/_layout.tsx`](app/_layout.tsx).

## Observed signature in the affected app

- `keyboardWillHide` fires with **no JS `onBlur`** on the focused input.
- react-native-screens logs
  `Failed to find parent screen controller from <RNSScreenContentWrapper ...>`
  after every keystroke, each time with a freshly incremented Fabric view tag —
  native views destroyed and recreated per render.
- Ruled out on-device: `collapsable={false}` wrappers
  (facebook/react-native#45798 predicts a blur that never fires),
  `keyboardDismissMode`, navigation-header options identity churn,
  react-native 0.86.2 (no related changelog entries).
