import type { themes } from "../shared/const";

export type ColorPickerRef = {
  getColor: () => string;
  setColor: (hex: string) => void;
  clearRecent: () => void;
  open: () => void;
  close: () => void;
};

export type TabId = "picker" | "values" | "recent";

export type ColorPickerLabels = {
  picker?: string;
  values?: string;
  recent?: string;
  save?: string;
  savedColors?: string;
  clearAll?: string;
  noSavedColors?: string;
  noSavedColorsHint?: string;
};

export type Theme = (typeof themes)["dark"];
