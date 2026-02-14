# @darthrapid/react-native-simple-color-picker

Lightweight HSB color picker for React Native with modal/inline modes, tabs, and i18n support. Pure JS, Expo compatible.

## Installation

```bash
bun add @darthrapid/react-native-simple-color-picker
```

### Peer dependency

```bash
bun add react-native-svg
```

## Basic Usage

By default, renders as a small color swatch. Tap it to open the picker modal.

```tsx
import { useState } from "react";
import { ColorPicker } from "@darthrapid/react-native-simple-color-picker";

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
<ColorPicker tabs={["picker", "values", "recent"]} />

// Picker and values only
<ColorPicker tabs={["picker", "values"]} />

// Picker only — tab bar is hidden
<ColorPicker tabs={["picker"]} />
```

| Tab | Content |
|---|---|
| `picker` | Saturation/brightness pad + hue slider |
| `values` | Hex input, RGB and HSB values |
| `recent` | Saved colors grid with "Clear All" |

## i18n / Custom Labels

```tsx
<ColorPicker
  labels={{
    picker: "Výber",
    values: "Hodnoty",
    recent: "Uložené",
    save: "Uložiť",
    savedColors: "Uložené farby",
    clearAll: "Vymazať všetko",
    noSavedColors: "Žiadne uložené farby",
    noSavedColorsHint: "Klikni \"Uložiť\" pre pridanie farieb",
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
| `value` | `string` | `"#007AFF"` | Current color (hex) |
| `onChange` | `(hex: string) => void` | – | Called when color changes |
| `tabs` | `TabId[]` | `["picker", "values", "recent"]` | Which tabs to show |
| `maxRecentColors` | `number` | `16` | Max number of saved colors |
| `panelWidth` | `number \| string` | `"100%"` | Panel width in modal mode. Ignored when `inline` |
| `hueStripHeight` | `number` | `28` | Hue slider height |
| `theme` | `"light" \| "dark"` | `"dark"` | Color theme |
| `disabled` | `boolean` | `false` | Disables touch input |
| `style` | `ViewStyle` | – | Style for the picker panel |
| `swatchSize` | `number` | `48` | Swatch trigger size |
| `swatchBorderRadius` | `number` | `12` | Swatch border radius |
| `swatchStyle` | `ViewStyle` | – | Style for the swatch trigger |
| `inline` | `boolean` | `false` | Renders picker inline without modal |
| `labels` | `ColorPickerLabels` | – | Custom labels (i18n) |
| `modalStyle` | `ViewStyle` | – | Style for the modal overlay wrapper |

## Ref API

```tsx
import { useRef } from "react";
import { ColorPicker, type ColorPickerRef } from "@darthrapid/react-native-simple-color-picker";

const ref = useRef<ColorPickerRef>(null);

<ColorPicker ref={ref} value={color} onChange={setColor} />
```

| Method | Description |
|---|---|
| `getColor()` | Returns current color as hex string |
| `setColor(hex)` | Sets color programmatically |
| `clearRecent()` | Clears saved colors |
| `open()` | Opens the modal (no-op when `inline`) |
| `close()` | Closes the modal (no-op when `inline`) |

## Examples

### Custom swatch size

```tsx
<ColorPicker
  value={color}
  onChange={setColor}
  swatchSize={40}
  swatchBorderRadius={8}
/>
```

### Full width modal

```tsx
<ColorPicker value={color} onChange={setColor} panelWidth="100%" />
```

### Fixed width modal

```tsx
<ColorPicker value={color} onChange={setColor} panelWidth={350} />
```

### Programmatic control

```tsx
ref.current?.setColor("#FF3B30");
ref.current?.open();
```

## License

MIT