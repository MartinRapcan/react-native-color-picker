export type ColorPickerRef = {
  /** Current color — `#RRGGBB`, or `#RRGGBBAA` when `showAlpha` is on. */
  getColor: () => string;
  /** Sets the color (any hex notation; alpha is applied when `showAlpha` is on). Fires `onChange`. */
  setColor: (hex: string) => void;
  clearSaved: () => void;
  removeSavedColor: (hex: string) => void;
  open: () => void;
  close: () => void;
};

export type TabId = "picker" | "values" | "palettes";

export type ColorPickerLabels = {
  picker?: string;
  values?: string;
  palettes?: string;
  save?: string;
  saved?: string;
  clearSaved?: string;
  /** Shown on the Clear button after the first tap, while waiting for confirmation. */
  confirmClear?: string;
  noSavedColors?: string;
  // Accessibility labels (read by screen readers)
  hue?: string;
  saturation?: string;
  brightness?: string;
  alpha?: string;
  hex?: string;
  red?: string;
  green?: string;
  blue?: string;
  openPicker?: string;
  closePicker?: string;
  removeColor?: string;
};

export type ColorPickerTheme = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  textDim: string;
  inputBg: string;
  thumbBorder: string;
  overlay: string;
  tabActive: string;
  tabInactive: string;
  tabIndicator: string;
  /** Text color on top of `tabIndicator` (active palette chip). */
  tabActiveText: string;
  /** Background of the "remove saved color" badge. */
  danger: string;
  /** Pressed background of the "remove saved color" badge. */
  dangerPressed: string;
  /** Foreground on top of `danger`. */
  onDanger: string;
};

/**
 * Either a built-in theme name or a partial override. Overrides are merged on
 * top of `base` (default `"dark"`).
 */
export type ColorPickerThemeProp =
  | "light"
  | "dark"
  | (Partial<ColorPickerTheme> & { base?: "light" | "dark" });

/** @deprecated use `ColorPickerTheme` */
export type Theme = ColorPickerTheme;
