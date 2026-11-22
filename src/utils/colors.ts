/**
 * Color math used by the picker.
 *
 * Internally the picker keeps HSB(A) as *unrounded* floats so that converting
 * hex → HSB → hex is lossless. Rounding only happens for display.
 *
 * Ranges: h 0–360, s 0–100, b (value) 0–100, a 0–100.
 */

export type Rgb = { r: number; g: number; b: number };
export type Hsb = { h: number; s: number; b: number };
export type Hsba = Hsb & { a: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Normalizes any supported hex notation (#RGB, #RGBA, #RRGGBB, #RRGGBBAA,
 * with or without `#`, surrounding whitespace allowed) to uppercase
 * `#RRGGBB` or `#RRGGBBAA`. Returns `null` for invalid input.
 */
export function normalizeHex(input: string): string | null {
  if (typeof input !== "string") return null;
  const match = HEX_RE.exec(input.trim());
  if (!match) return null;
  let body = match[1]!;
  if (body.length <= 4) {
    body = body
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${body.toUpperCase()}`;
}

/** True for #RGB, #RGBA, #RRGGBB and #RRGGBBAA (the `#` is optional). */
export function isValidHex(hex: string): boolean {
  return normalizeHex(hex) !== null;
}

const toHexByte = (v: number) =>
  Math.round(clamp(v, 0, 255))
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

/** Parses the RGB part of any supported hex. Invalid input yields black. */
export function hexToRgb(hex: string): Rgb {
  const full = normalizeHex(hex) ?? "#000000";
  return {
    r: parseInt(full.slice(1, 3), 16),
    g: parseInt(full.slice(3, 5), 16),
    b: parseInt(full.slice(5, 7), 16),
  };
}

export function hsbToRgb(h: number, s: number, b: number): Rgb {
  const hh = ((h % 360) + 360) % 360;
  const s1 = clamp(s, 0, 100) / 100;
  const b1 = clamp(b, 0, 100) / 100;
  const k = (n: number) => (n + hh / 60) % 6;
  const f = (n: number) => b1 * (1 - s1 * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 };
}

/**
 * RGB (0–255) → HSB floats. When the color has no hue (grey, black, white)
 * `fallbackHue` is returned, so the hue slider doesn't jump to red.
 */
export function rgbToHsb({ r, g, b }: Rgb, fallbackHue = 0): Hsb {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const d = max - min;
  let h = fallbackHue;
  if (d !== 0) {
    if (max === r1) h = ((g1 - b1) / d + 6) % 6;
    else if (max === g1) h = (b1 - r1) / d + 2;
    else h = (r1 - g1) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  return { h, s, b: max * 100 };
}

export function hsbToHex(h: number, s: number, b: number): string {
  return rgbToHex(hsbToRgb(h, s, b));
}

/** Hex → HSB floats (alpha ignored). See `rgbToHsb` for `fallbackHue`. */
export function hexToHsb(hex: string, fallbackHue = 0): Hsb {
  return rgbToHsb(hexToRgb(hex), fallbackHue);
}

/** Alpha of an 8-digit hex as 0–100 (unrounded). 100 when there is no alpha. */
export function parseAlphaFromHex(hex: string): number {
  const full = normalizeHex(hex);
  if (!full || full.length !== 9) return 100;
  return (parseInt(full.slice(7, 9), 16) / 255) * 100;
}

/** Returns `#RRGGBBAA`. `alpha` is 0–100. */
export function appendAlphaToHex(hex: string, alpha: number): string {
  const base = (normalizeHex(hex) ?? "#000000").slice(0, 7);
  return `${base}${toHexByte((clamp(alpha, 0, 100) / 100) * 255)}`;
}

/**
 * Parses a hex into HSBA floats, or `null` when invalid.
 * `fallbackHue` is kept for colors without a hue.
 */
export function parseColor(hex: string, fallbackHue = 0): Hsba | null {
  const full = normalizeHex(hex);
  if (!full) return null;
  return { ...hexToHsb(full, fallbackHue), a: parseAlphaFromHex(full) };
}

/** Serializes HSBA to `#RRGGBB`, or `#RRGGBBAA` when `withAlpha` is set. */
export function formatColor(color: Hsba, withAlpha: boolean): string {
  const hex = hsbToHex(color.h, color.s, color.b);
  return withAlpha ? appendAlphaToHex(hex, color.a) : hex;
}

/** Colors on a checkerboard average out to roughly this grey (#CCC + #FFF). */
const CHECKER_AVG = 230;

/** Black or white, whichever reads better on top of `hex` (blended over the checkerboard). */
export function getContrastColor(hex: string, alpha = 100): "#000000" | "#FFFFFF" {
  const { r, g, b } = hexToRgb(hex);
  const a = clamp(alpha, 0, 100) / 100;
  const blend = (c: number) => c * a + CHECKER_AVG * (1 - a);
  const luminance = (0.299 * blend(r) + 0.587 * blend(g) + 0.114 * blend(b)) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/** `rgba(r, g, b, a)` string; `alpha` is 0–100. */
export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  const a = Math.round(clamp(alpha, 0, 100) * 10) / 1000;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
