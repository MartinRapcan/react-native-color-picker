# @darthrapid/react-native-color-picker

Lightweight HSB color picker for React Native with alpha channel, color palettes, saved colors with per-item delete, modal/inline modes, light/dark themes and i18n. Pure JS, works in Expo Go.

## Installation

```bash
bun add @darthrapid/react-native-color-picker
```

### Peer dependency

```bash
bun add react-native-svg
```

Requires `react-native-svg >= 15.15.5` (peer). Works with anything Expo SDK 54+ ships.

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
| `values` | Hex input, RGB and HSB values |
| `palettes` | Color palettes + saved colors grid (with per-item delete) |

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

## Saved Colors

The Palettes tab has a **Saved** section where users can save colors and remove them individually via the red ✕ badge on each swatch.

### Uncontrolled (session-only)

Let the component manage saved colors internally — data isn't persisted across mounts.

```tsx
<ColorPicker value={color} onChange={setColor} />
```

### Controlled (persistable)

Bind the saved list to your own state so you can persist it (AsyncStorage, MMKV, backend…).

```tsx
const [savedColors, setSavedColors] = useState<string[]>([]);

<ColorPicker
  value={color}
  onChange={setColor}
  savedColors={savedColors}
  onSaveColor={(hex) =>
    setSavedColors((prev) => (prev.includes(hex) ? prev : [hex, ...prev]))
  }
  onRemoveSavedColor={(hex) =>
    setSavedColors((prev) => prev.filter((c) => c !== hex))
  }
  onClearSaved={() => setSavedColors([])}
/>
```

Callbacks:
| Callback | Fired when |
|---|---|
| `onSaveColor(hex)` | User taps **Save** in the color preview header |
| `onRemoveSavedColor(hex)` | User taps the red ✕ on a saved swatch |
| `onClearSaved()` | User taps **Clear** in the Saved section header |

## Light / Dark Theme

```tsx
<ColorPicker theme="dark" />  // default
<ColorPicker theme="light" />
```

The panel has a subtle border in both themes so it stays visible on any background (including white).

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
    noSavedColors: "Žiadne uložené farby",
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `"#007AFF"` | Current color (6- or 8-digit hex) |
| `onChange` | `(hex: string) => void` | – | Called when color changes |
| `tabs` | `TabId[]` | `["picker", "values", "palettes"]` | Which tabs to show. `"picker"` is auto-prepended if missing |
| `panelWidth` | `DimensionValue` | `"100%"` | Panel width in modal mode. Ignored when `inline` |
| `hueStripHeight` | `number` | `28` | Hue/alpha slider height |
| `theme` | `"light" \| "dark"` | `"dark"` | Color theme |
| `disabled` | `boolean` | `false` | Disables all touch input |
| `style` | `ViewStyle` | – | Style for the picker panel |
| `swatchSize` | `number` | `48` | Size of the modal-trigger swatch |
| `swatchBorderRadius` | `number` | `12` | Border radius of the swatch |
| `swatchStyle` | `ViewStyle` | – | Extra style for the swatch |
| `inline` | `boolean` | `false` | Renders picker inline without modal |
| `labels` | `ColorPickerLabels` | – | Custom labels (i18n) |
| `contentStyle` | `ViewStyle` | – | Style for the modal content wrapper |
| `showAlpha` | `boolean` | `false` | Show alpha channel slider |
| `palettes` | `ColorPalette[]` | – | Color palettes for the Palettes tab |
| `savedColors` | `string[]` | – | Saved colors (controlled). If provided, component won't manage saved colors internally |
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
| `getColor()` | Returns current color as hex string |
| `setColor(hex)` | Sets the color programmatically |
| `removeSavedColor(hex)` | Removes a specific saved color (works in both modes) |
| `clearSaved()` | Clears all saved colors |
| `open()` | Opens the modal (no-op when `inline`) |
| `close()` | Closes the modal (no-op when `inline`) |

## Exports

```tsx
import {
  ColorPicker,
  type ColorPickerProps,
  type ColorPickerRef,
  type ColorPickerLabels,
  type ColorPalette,
  type TabId,
  tailwindPalette,
  tailwindColors,
} from "@darthrapid/react-native-color-picker";
```

## Full Example

Full-featured picker with alpha, Tailwind palette, and persistable saved colors.

```tsx
import { useState } from "react";
import { ColorPicker, tailwindPalette } from "@darthrapid/react-native-color-picker";

export default function App() {
  const [color, setColor] = useState("#3B82F6");
  const [savedColors, setSavedColors] = useState<string[]>([]);

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      showAlpha
      palettes={[tailwindPalette]}
      savedColors={savedColors}
      onSaveColor={(hex) =>
        setSavedColors((prev) => (prev.includes(hex) ? prev : [hex, ...prev]))
      }
      onRemoveSavedColor={(hex) =>
        setSavedColors((prev) => prev.filter((c) => c !== hex))
      }
      onClearSaved={() => setSavedColors([])}
    />
  );
}
```

## License

MIT
