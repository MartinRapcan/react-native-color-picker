export function hsbToHex(h: number, s: number, b: number): string {
  const s1 = s / 100;
  const b1 = b / 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) =>
    b1 * (1 - s1 * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
}

export function hexToHsb(hex: string): { h: number; s: number; b: number } {
  let clean = hex.replace("#", "");
  // Strip alpha channel if 8-digit hex
  if (clean.length === 8) clean = clean.slice(0, 6);
  const full =
    clean.length === 3
      ? clean
        .split("")
        .map((c) => c + c)
        .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  return { h: Math.round(h), s: Math.round(s), b: Math.round(max * 100) };
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
}

export function parseAlphaFromHex(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length === 8) {
    return Math.round((parseInt(clean.slice(6, 8), 16) / 255) * 100);
  }
  return 100;
}

export function appendAlphaToHex(hex: string, alpha: number): string {
  const base = hex.startsWith("#") ? hex.slice(0, 7) : `#${hex.slice(0, 6)}`;
  const alphaHex = Math.round((alpha / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${base}${alphaHex}`;
}

export function getContrastColor(hex: string, alpha = 100): string {
  const { r, g, b } = hexToRgb(hex);
  // Checkerboard average is ~230 (mix of #CCCCCC and #FFFFFF)
  const checkerAvg = 230;
  const a = alpha / 100;
  // Blend color with checkerboard background
  const blendedR = r * a + checkerAvg * (1 - a);
  const blendedG = g * a + checkerAvg * (1 - a);
  const blendedB = b * a + checkerAvg * (1 - a);
  const luminance = (0.299 * blendedR + 0.587 * blendedG + 0.114 * blendedB) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
}