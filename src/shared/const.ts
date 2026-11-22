import type { ColorPickerLabels, ColorPickerTheme, ColorPickerThemeProp, TabId } from "../types/misc";

export const DEFAULT_COLOR = "#007AFF";

export const DEFAULT_TABS: readonly TabId[] = ["picker", "values", "palettes"];

export const DEFAULT_LABELS: Required<ColorPickerLabels> = {
  picker: "Picker",
  values: "Values",
  palettes: "Palettes",
  save: "Save",
  saved: "Saved",
  clearSaved: "Clear",
  confirmClear: "Confirm?",
  noSavedColors: "No saved colors",
  hue: "Hue",
  saturation: "Saturation",
  brightness: "Brightness",
  alpha: "Opacity",
  hex: "Hex color",
  red: "Red",
  green: "Green",
  blue: "Blue",
  openPicker: "Open color picker",
  closePicker: "Close color picker",
  removeColor: "Remove color",
};

export const themes: { dark: ColorPickerTheme; light: ColorPickerTheme } = {
  dark: {
    background: "#1A1A2E",
    surface: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.4)",
    textDim: "rgba(255,255,255,0.2)",
    inputBg: "rgba(255,255,255,0.08)",
    thumbBorder: "#FFFFFF",
    overlay: "rgba(0,0,0,0.6)",
    tabActive: "#FFFFFF",
    tabInactive: "rgba(255,255,255,0.3)",
    tabIndicator: "#FFFFFF",
    tabActiveText: "#000000",
    danger: "#E53935",
    dangerPressed: "#B71C1C",
    onDanger: "#FFFFFF",
  },
  light: {
    background: "#FFFFFF",
    surface: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.12)",
    text: "#000000",
    textMuted: "rgba(0,0,0,0.5)",
    textDim: "rgba(0,0,0,0.2)",
    inputBg: "rgba(0,0,0,0.05)",
    thumbBorder: "#FFFFFF",
    overlay: "rgba(0,0,0,0.4)",
    tabActive: "#000000",
    tabInactive: "rgba(0,0,0,0.3)",
    tabIndicator: "#000000",
    tabActiveText: "#FFFFFF",
    danger: "#E53935",
    dangerPressed: "#B71C1C",
    onDanger: "#FFFFFF",
  },
};

export function resolveTheme(theme: ColorPickerThemeProp | undefined): ColorPickerTheme {
  if (theme === undefined || theme === "dark") return themes.dark;
  if (theme === "light") return themes.light;
  const { base = "dark", ...overrides } = theme;
  return { ...themes[base], ...overrides };
}

/** Swatches used for checkerboards behind translucent colors. */
export const CHECKER_LIGHT = "#FFFFFF";
export const CHECKER_DARK = "#CCCCCC";
