# @darthrapid/react-native-color-picker

Lightweight HSB color picker for React Native with alpha channel, editable values, color palettes, saved colors, modal/inline modes, light/dark/custom themes, i18n and screen-reader support. Pure JS, works in Expo Go.

## Installation

```bash
bun add @darthrapid/react-native-color-picker
```

### Peer dependency

```bash
bun add react-native-svg
```

Requires `react-native-svg >= 15.15.5` and React 18+ (peers). Works with anything Expo SDK 54+ ships.

## What's new in 1.3.0

- **Lossless colors** — HSB is kept as unrounded floats internally, so the color you pass in (or tap in a palette) is exactly the color you get back. Previously ~87 % of hex colors drifted by one step (e.g. `#007AFF` → `#007BFF`).
- **Hue is preserved for greys** — picking a grey / black / white no longer snaps the hue slider to red.
- **`onChangeComplete`** — fires once when an interaction ends (finger lifted, value typed, swatch tapped). `onChange` now also skips frames where the hex didn't change.
- **Editable Values tab** — type R, G, B, H, S, B and A directly. The hex field accepts `#RGB`, `#RGBA`, `#RRGGBB` and `#RRGGBBAA` (8 digits when `showAlpha` is on) and commits exactly once.
- **Accessibility** — sliders are `adjustable` with values and increment/decrement actions; swatches, tabs and buttons have roles and labels (all translatable via `labels`).
- **Custom themes** — `theme={{ base: "light", background: "#F5F5F5" }}`; `ColorPickerTheme` and `themes` are exported.
- **Saved colors** — `onSavedColorsChange(colors)` and `defaultSavedColors`; "Clear" asks for confirmation (`confirmClear`, default `true`).
- **`initialTab`**, and the selected tab is remembered when the modal is closed and reopened.
- **Ref API** — `getColor()` includes alpha when `showAlpha` is on; `setColor()` accepts any hex notation and keeps the current alpha unless the hex has one.
- **Fixes** — unique SVG gradient ids (two pickers on one screen no longer share gradients on Expo Web), thumbs no longer get clipped at the pad corners, touch handling no longer depends on an async `measure()`, invalid `value` falls back to the default instead of producing `NaN`.
- Requires React ≥ 18 (`useId`).
- **Behavior changes** — output hex is now uppercase (`#007AFF`), "Clear" needs a second tap, `getColor()` includes alpha when `showAlpha` is on. See the [v1.3.0 release notes](https://github.com/MartinRapcan/react-native-color-picker/releases/tag/v1.3.0) before upgrading.

Patch releases (1.3.1, 1.3.2) and older changes: see [Releases](https://github.com/MartinRapcan/react-native-color-picker/releases).

## What's new in 1.2.0

- **`onRemoveSavedColor` prop** and **`ref.removeSavedColor(hex)`** — delete a specific saved color in controlled or programmatic flows.
- **Red ✕ delete button** on each saved swatch — visible in the Palettes tab's "Saved" section (overflows the swatch corner for a badge look).
- **`picker` tab is auto-enforced** — if you pass `tabs={["values"]}` the package normalizes it to `["picker", "values"]`. You can never accidentally ship a picker without any way to pick.
- **Visible panel border on light theme** — no more invisible edge on white backgrounds.
- **Progressive palette rendering** — big palettes (e.g. Tailwind, ~22 groups) render the first rows immediately and stream the rest across frames.
- **Safe to nest inside a ScrollView** — the palettes list no longer uses a `FlatList`, so consumers can drop `<ColorPicker inline>` into any layout without the "VirtualizedLists should never be nested" warning.

## Basic Usage

By default, renders as a small color swatch. Tap it to open the picker in a modal.

```tsx
import { useState } from "react";
import { ColorPicker } from "@darthrapid/react-native-color-picker";

export default function App() {
  const [color, setColor] = useState("#007AFF");

  return <ColorPicker value={color} onChange={setColor} />;
}
```

## Inline Mode

Renders the picker directly in your layout — adapts to parent width.

```tsx
<ColorPicker value={color} onChange={setColor} inline />
```

## Tabs

The picker has 3 tabs. You choose which are shown; **`picker` is always included** even if you omit it (the package prepends it).

```tsx
// All tabs (default)
<ColorPicker tabs={["picker", "values", "palettes"]} />

// Picker + Values only
<ColorPicker tabs={["picker", "values"]} />

// Picker + Palettes only
<ColorPicker tabs={["picker", "palettes"]} />

// Picker only — tab bar is hidden
<ColorPicker tabs={["picker"]} />

// Passing only ["values"] is normalized to ["picker", "values"]
<ColorPicker tabs={["values"]} />
```

| Tab | Content |
|---|---|
| `picker` | Saturation/brightness pad + hue slider (+ alpha slider when enabled) |
| `values` | Editable hex, RGB(A) and HSB values |
| `palettes` | Color palettes + saved colors grid (with per-item delete) |

Use `initialTab` to choose which tab is selected first:

```tsx
<ColorPicker initialTab="palettes" />
```

## onChange vs onChangeComplete

`onChange` fires on every drag frame. Use `onChangeComplete` for anything expensive (saving, network, analytics) — it fires once per interaction.

```tsx
<ColorPicker
  value={color}
  onChange={setColor}
  onChangeComplete={(hex) => saveToServer(hex)}
/>
```

Both receive uppercase `#RRGGBB`, or `#RRGGBBAA` when `showAlpha` is on. `value` accepts `#RGB`, `#RGBA`, `#RRGGBB` and `#RRGGBBAA`.

## Alpha Channel

Enable alpha with `showAlpha`. Values become 8-digit hex (`#RRGGBBAA`).

```tsx
const [color, setColor] = useState("#007AFFCC");

<ColorPicker
  value={color}
  onChange={setColor}
  showAlpha
/>
```

## Color Palettes

Each palette can contain simple colors or color groups with shades.

```tsx
import { ColorPicker, tailwindPalette } from "@darthrapid/react-native-color-picker";

// Built-in Tailwind palette
<ColorPicker value={color} onChange={setColor} palettes={[tailwindPalette]} />

// Custom palette with simple colors
<ColorPicker
  value={color}
  onChange={setColor}
  palettes={[
    {
      name: "Brand",
      colors: {
        primary: "#007AFF",
        secondary: "#5856D6",
        accent: "#FF2D55",
      },
    },
  ]}
/>

// Custom palette with color shades
<ColorPicker
  value={color}
  onChange={setColor}
  palettes={[
    {
      name: "Brand",
      colors: {
        blue: { 100: "#DBEAFE", 500: "#3B82F6", 900: "#1E3A8A" },
        gray: { 100: "#F3F4F6", 500: "#6B7280", 900: "#111827" },
      },
    },
  ]}
/>
```

You can pass multiple palettes — a horizontal palette picker appears above the swatches.

Define palettes outside your component (or memoize them). In TypeScript, use `satisfies` to check the shape while keeping exact types:

```tsx
import { type ColorPalette } from "@darthrapid/react-native-color-picker";

const brandPalette = {
  name: "Brand",
  colors: { primary: "#007AFF", blue: { 100: "#DBEAFE", 500: "#3B82F6" } },
} satisfies ColorPalette;

brandPalette.colors.blue[500]; // string ✓
```

## Saved Colors

The Palettes tab has a **Saved** section where users can save colors and remove them individually via the red ✕ badge on each swatch.

### Uncontrolled (session-only)

Let the component manage saved colors internally — data isn't persisted across mounts.

```tsx
<ColorPicker value={color} onChange={setColor} />
```

Uncontrolled pickers can start with `defaultSavedColors={["#FF3B30", "#34C759"]}`.

### Controlled (persistable)

Bind the saved list to your own state so you can persist it (AsyncStorage, MMKV, backend…). The picker computes the new list on save / ✕ / clear and hands it to `onSavedColorsChange` — you just store it:

```tsx
const [savedColors, setSavedColors] = useState<string[]>([]);

<ColorPicker
  value={color}
  onChange={setColor}
  savedColors={savedColors}
  onSavedColorsChange={(colors) => {
    setSavedColors(colors);
    AsyncStorage.setItem("savedColors", JSON.stringify(colors));
  }}
/>
```

Load the initial list into your state (e.g. from AsyncStorage on mount) — the picker shows whatever `savedColors` contains.

The per-action callbacks still work, alone (as in 1.2) or together with `onSavedColorsChange` (e.g. for analytics):

```tsx
<ColorPicker
  savedColors={savedColors}
  onSaveColor={(hex) => setSavedColors((prev) => (prev.includes(hex) ? prev : [hex, ...prev]))}
  onRemoveSavedColor={(hex) => setSavedColors((prev) => prev.filter((c) => c !== hex))}
  onClearSaved={() => setSavedColors([])}
/>
```

Callbacks:
| Callback | Fired when |
|---|---|
| `onSavedColorsChange(colors)` | The list changes in any way (save, remove, clear) — receives the new list |
| `onSaveColor(hex)` | User taps **Save** in the color preview header (duplicates are ignored) |
| `onRemoveSavedColor(hex)` | User taps the red ✕ on a saved swatch |
| `onClearSaved()` | User confirms **Clear** in the Saved section header |

"Clear" needs a second tap to confirm (the label changes to `labels.confirmClear`). Pass `confirmClear={false}` to clear on the first tap.

In controlled mode the ✕ badges and the Clear button are only shown when you pass a handler for them (or `onSavedColorsChange`).

## Themes

```tsx
<ColorPicker theme="dark" />  // default
<ColorPicker theme="light" />
```

The panel has a subtle border in both themes so it stays visible on any background (including white).

### Custom theme

Pass a partial theme — it's merged on top of `base` (`"dark"` by default):

```tsx
<ColorPicker
  theme={{
    base: "light",
    background: "#F7F7F8",
    tabIndicator: "#6D28D9",
    tabActive: "#6D28D9",
    tabActiveText: "#FFFFFF",
  }}
/>
```

Available keys (`ColorPickerTheme`): `background`, `surface`, `border`, `text`, `textMuted`, `textDim`, `inputBg`, `thumbBorder`, `overlay`, `tabActive`, `tabInactive`, `tabIndicator`, `tabActiveText`, `danger`, `dangerPressed`, `onDanger`. The built-in themes are exported as `themes.light` / `themes.dark`.

## i18n / Custom Labels

Override only the labels you want — the rest stays English by default.

```tsx
<ColorPicker
  labels={{
    picker: "Výber",
    values: "Hodnoty",
    palettes: "Palety",
    save: "Uložiť",
    saved: "Uložené",
    clearSaved: "Vymazať",
    confirmClear: "Naozaj?",
    noSavedColors: "Žiadne uložené farby",
    // Screen-reader labels
    hue: "Odtieň",
    saturation: "Sýtosť",
    brightness: "Jas",
    alpha: "Priehľadnosť",
    hex: "Hex farba",
    red: "Červená",
    green: "Zelená",
    blue: "Modrá",
    openPicker: "Otvoriť výber farby",
    closePicker: "Zavrieť výber farby",
    removeColor: "Odstrániť farbu",
  }}
/>
```

## Accessibility

- The saturation/brightness pad and the hue/alpha sliders use `accessibilityRole="adjustable"` with spoken values (e.g. "210°", "80%") and support increment/decrement (swipe up/down in VoiceOver/TalkBack). The pad also exposes custom actions for brightness.
- Swatches, tabs, the Save/Clear buttons and the ✕ badges have roles and labels.
- All spoken strings come from `labels`, so they can be translated.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `"#007AFF"` | Current color (`#RGB`, `#RGBA`, `#RRGGBB` or `#RRGGBBAA`) |
| `onChange` | `(hex: string) => void` | – | Called when the color changes (every drag frame) |
| `onChangeComplete` | `(hex: string) => void` | – | Called once when an interaction ends |
| `tabs` | `TabId[]` | `["picker", "values", "palettes"]` | Which tabs to show. `"picker"` is auto-prepended if missing |
| `initialTab` | `TabId` | first tab | Tab selected when the picker is first shown |
| `panelWidth` | `DimensionValue` | `"100%"` | Panel width in modal mode. Ignored when `inline` |
| `hueStripHeight` | `number` | `28` | Hue/alpha slider height |
| `theme` | `"light" \| "dark" \| Partial<ColorPickerTheme> & { base? }` | `"dark"` | Built-in theme or a partial override |
| `disabled` | `boolean` | `false` | Disables all touch input |
| `style` | `ViewStyle` | – | Style for the picker panel |
| `swatchSize` | `number` | `48` | Size of the modal-trigger swatch |
| `swatchBorderRadius` | `number` | `12` | Border radius of the swatch |
| `swatchStyle` | `ViewStyle` | – | Extra style for the swatch |
| `inline` | `boolean` | `false` | Renders picker inline without modal |
| `labels` | `ColorPickerLabels` | – | Custom labels (i18n, incl. screen-reader labels) |
| `contentStyle` | `ViewStyle` | – | Style for the modal content wrapper |
| `showAlpha` | `boolean` | `false` | Show alpha channel slider |
| `palettes` | `ColorPalette[]` | – | Color palettes for the Palettes tab (define outside render or memoize) |
| `savedColors` | `string[]` | – | Saved colors (controlled). If provided, component won't manage saved colors internally |
| `defaultSavedColors` | `string[]` | `[]` | Initial saved colors (uncontrolled) |
| `onSavedColorsChange` | `(colors: string[]) => void` | – | Called with the new list on save / remove / clear |
| `confirmClear` | `boolean` | `true` | Require a second tap on "Clear" |
| `onSaveColor` | `(hex: string) => void` | – | Called when user saves a color |
| `onRemoveSavedColor` | `(hex: string) => void` | – | Called when user removes a specific saved color |
| `onClearSaved` | `() => void` | – | Called when user clears all saved colors |

## Ref API

```tsx
import { useRef } from "react";
import { ColorPicker, type ColorPickerRef } from "@darthrapid/react-native-color-picker";

const ref = useRef<ColorPickerRef>(null);

<ColorPicker ref={ref} value={color} onChange={setColor} />
```

| Method | Description |
|---|---|
| `getColor()` | Current color — `#RRGGBB`, or `#RRGGBBAA` when `showAlpha` is on |
| `setColor(hex)` | Sets the color (any hex notation). Keeps the current alpha unless the hex has one. Fires `onChange` and `onChangeComplete` |
| `removeSavedColor(hex)` | Removes a specific saved color (works in both modes, fires `onSavedColorsChange`) |
| `clearSaved()` | Clears all saved colors right away — no confirmation step (fires `onSavedColorsChange`) |
| `open()` | Opens the modal (no-op when `inline`) |
| `close()` | Closes the modal (no-op when `inline`) |

## Exports

```tsx
import {
  ColorPicker,
  type ColorPickerProps,
  type ColorPickerRef,
  type ColorPickerLabels,
  type ColorPickerTheme,
  type ColorPickerThemeProp,
  type ColorPalette,
  type ColorValue,
  type TabId,
  tailwindPalette,
  tailwindColors,
  themes,
  DEFAULT_LABELS,
  // Color helpers
  type Rgb,
  type Hsb,
  type Hsba,
  normalizeHex,
  isValidHex,
  hexToRgb,
  rgbToHex,
  hexToHsb,
  hsbToHex,
  parseColor,
  formatColor,
  getContrastColor,
} from "@darthrapid/react-native-color-picker";
```

## Full Example

Full-featured picker with alpha, Tailwind palette, persisted saved colors and a save-on-release callback.

```tsx
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorPicker, tailwindPalette } from "@darthrapid/react-native-color-picker";

export default function App() {
  const [color, setColor] = useState("#3B82F6");
  const [savedColors, setSavedColors] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("savedColors").then((json) => {
      if (json) setSavedColors(JSON.parse(json));
    });
  }, []);

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      onChangeComplete={(hex) => console.log("final color", hex)}
      showAlpha
      palettes={[tailwindPalette]}
      savedColors={savedColors}
      onSavedColorsChange={(colors) => {
        setSavedColors(colors);
        AsyncStorage.setItem("savedColors", JSON.stringify(colors));
      }}
    />
  );
}
```

## Development

```bash
bun install
bun run typecheck
bun run lint           # oxlint
bun run format:check   # oxfmt (bun run format to fix)
bun run test
bun run example start  # Expo example app
```

## License

MIT
