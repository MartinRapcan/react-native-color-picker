import type { ColorPickerLabels } from "../types/misc";

export const DEFAULT_LABELS: Required<ColorPickerLabels> = {
  picker: "Picker",
  values: "Values",
  recent: "Recent",
  save: "Save",
  savedColors: "Saved Colors",
  clearAll: "Clear All",
  noSavedColors: "No saved colors yet",
  noSavedColorsHint: 'Tap "Save" to add colors here',
};

export const themes = {
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
  },
  light: {
    background: "#FFFFFF",
    surface: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.08)",
    text: "#000000",
    textMuted: "rgba(0,0,0,0.5)",
    textDim: "rgba(0,0,0,0.2)",
    inputBg: "rgba(0,0,0,0.05)",
    thumbBorder: "#FFFFFF",
    overlay: "rgba(0,0,0,0.4)",
    tabActive: "#000000",
    tabInactive: "rgba(0,0,0,0.3)",
    tabIndicator: "#000000",
  },
};