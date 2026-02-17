import type { themes } from "../shared/const";

export type ColorPickerRef = {
  getColor: () => string;
  setColor: (hex: string) => void;
  clearSaved: () => void;
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
  noSavedColors?: string;
};

export type Theme = (typeof themes)["dark"];
