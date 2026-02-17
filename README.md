# @darthrapid/react-native-color-picker

Lightweight HSB color picker for React Native with alpha channel support, color palettes, modal/inline modes, and i18n. Pure JS, Expo compatible.

## Installation

```bash
bun add @darthrapid/react-native-color-picker
```

### Peer dependency

```bash
bun add react-native-svg
```

## Basic Usage

By default, renders as a small color swatch. Tap it to open the picker modal.

```tsx
import { useState } from "react";
import { ColorPicker } from "@darthrapid/react-native-color-picker";

export default function App() {
  const [color, setColor] = useState("#007AFF");

  return <ColorPicker value={color} onChange={setColor} />;
}
```

## Inline Mode

Renders the picker directly in your layout without a modal — adapts to parent width.

```tsx
<ColorPicker value={color} onChange={setColor} inline />
```

## Tabs

The picker has 3 tabs — only selected ones are shown:

```tsx
// All (default)
<ColorPicker tabs={["picker", "values", "palettes"]} />

// Picker and values only
<ColorPicker tabs={["picker", "values"]} />

// Picker only — tab bar is hidden
<ColorPicker tabs={["picker"]} />
```

| Tab | Content |
|---|---|
| `picker` | Saturation/brightness pad + hue slider (+ alpha slider when enabled) |
| `values` | Hex input, RGB and HSB values, save button |
| `palettes` | Color palettes + saved colors grid |

## Alpha Channel

Enable alpha channel support with `showAlpha`. The picker will show an alpha slider and return 8-digit hex colors (#RRGGBBAA).

```tsx
const [color, setColor] = useState("#007AFFCC");

<ColorPicker
  value={color}
  onChange={setColor}
  showAlpha
/>
```

## Color Palettes

The palettes tab supports custom color palettes. Each palette can contain simple colors or color groups with shades.

```tsx
import { ColorPicker, tailwindPalette } from "@darthrapid/react-native-color-picker";

// Use built-in Tailwind palette
<ColorPicker
  value={color}
  onChange={setColor}
  palettes={[tailwindPalette]}
/>

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
        blue: {
          100: "#DBEAFE",
          500: "#3B82F6",
          900: "#1E3A8A",
        },
        gray: {
          100: "#F3F4F6",
          500: "#6B7280",
          900: "#111827",
        },
      },
    },
  ]}
/>
```

## Saved Colors

The palettes tab includes a "Saved" section where users can save colors. Use controlled mode for persistence:

```tsx
const [savedColors, setSavedColors] = useState<string[]>([]);

<ColorPicker
  value={color}
  onChange={setColor}
  savedColors={savedColors}
  onSaveColor={(hex) => setSavedColors((prev) => [hex, ...prev])}
  onClearSaved={() => setSavedColors([])}
/>
```

Or let the component manage saved colors internally (non-persistent):

```tsx
<ColorPicker value={color} onChange={setColor} />
```

## i18n / Custom Labels

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

Only pass the labels you want to override — the rest stays English by default.

## Light / Dark Theme

```tsx
<ColorPicker theme="dark" />  // default
<ColorPicker theme="light" />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `"#007AFF"` | Current color (6 or 8 digit hex) |
| `onChange` | `(hex: string) => void` | – | Called when color changes |
| `tabs` | `TabId[]` | `["picker", "values", "palettes"]` | Which tabs to show |
| `panelWidth` | `DimensionValue` | `"100%"` | Panel width in modal mode. Ignored when `inline` |
| `hueStripHeight` | `number` | `28` | Hue/alpha slider height |
| `theme` | `"light" \| "dark"` | `"dark"` | Color theme |
| `disabled` | `boolean` | `false` | Disables touch input |
| `style` | `ViewStyle` | – | Style for the picker panel |
| `swatchSize` | `number` | `48` | Swatch trigger size |
| `swatchBorderRadius` | `number` | `12` | Swatch border radius |
| `swatchStyle` | `ViewStyle` | – | Style for the swatch trigger |
| `inline` | `boolean` | `false` | Renders picker inline without modal |
| `labels` | `ColorPickerLabels` | – | Custom labels (i18n) |
| `contentStyle` | `ViewStyle` | – | Style for the modal content wrapper |
| `showAlpha` | `boolean` | `false` | Show alpha channel slider |
| `palettes` | `ColorPalette[]` | – | Color palettes for the palettes tab |
| `savedColors` | `string[]` | – | Saved colors (controlled mode) |
| `onSaveColor` | `(hex: string) => void` | – | Called when user saves a color |
| `onClearSaved` | `() => void` | – | Called when user clears saved colors |

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
| `setColor(hex)` | Sets color programmatically |
| `clearSaved()` | Clears saved colors |
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
  tailwindPalette,
} from "@darthrapid/react-native-color-picker";
```

## Examples

### Full-featured picker with alpha and Tailwind palette

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
      onSaveColor={(hex) => setSavedColors((prev) => [hex, ...prev])}
      onClearSaved={() => setSavedColors([])}
    />
  );
}
```

### Custom swatch size

```tsx
<ColorPicker
  value={color}
  onChange={setColor}
  swatchSize={40}
  swatchBorderRadius={8}
/>
```

### Programmatic control

```tsx
ref.current?.setColor("#FF3B30");
ref.current?.open();
```

## License

MIT
