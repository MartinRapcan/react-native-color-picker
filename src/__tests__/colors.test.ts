import { positionToRatio, ratioToPosition } from "../hooks/use-slider-gesture";
import {
  appendAlphaToHex,
  formatColor,
  getContrastColor,
  hexToHsb,
  hexToRgb,
  hexToRgba,
  hsbToHex,
  isValidHex,
  normalizeHex,
  parseAlphaFromHex,
  parseColor,
  rgbToHsb,
} from "../utils/colors";

// Small deterministic PRNG so the "random" sweep is reproducible.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("normalizeHex / isValidHex", () => {
  it.each([
    ["#fff", "#FFFFFF"],
    ["fff", "#FFFFFF"],
    ["#f0a8", "#FF00AA88"],
    ["#007aff", "#007AFF"],
    ["007AFF", "#007AFF"],
    ["  #007AFFcc ", "#007AFFCC"],
  ])("%p → %p", (input, expected) => {
    expect(normalizeHex(input)).toBe(expected);
    expect(isValidHex(input)).toBe(true);
  });

  it.each(["", "#", "#12", "#12345", "#1234567", "#GGGGGG", "red", "#007AFF00FF"])("rejects %p", (input) => {
    expect(normalizeHex(input)).toBeNull();
    expect(isValidHex(input)).toBe(false);
  });
});

describe("hex ⇄ HSB round trip", () => {
  it.each([
    "#007AFF",
    "#FB2C36",
    "#E7180B",
    "#FEF2F2",
    "#79716B",
    "#0C0A09",
    "#336699",
    "#000000",
    "#FFFFFF",
  ])("%s survives hex → HSB → hex", (hex) => {
    const { h, s, b } = hexToHsb(hex);
    expect(hsbToHex(h, s, b)).toBe(hex);
  });

  it("is lossless for 50 000 random colors", () => {
    const rand = mulberry32(42);
    const mismatches: string[] = [];
    for (let i = 0; i < 50_000; i++) {
      const hex = `#${Math.floor(rand() * 0x1000000)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase()}`;
      const { h, s, b } = hexToHsb(hex);
      if (hsbToHex(h, s, b) !== hex) mismatches.push(hex);
    }
    expect(mismatches).toEqual([]);
  });

  it("is lossless for every alpha byte", () => {
    for (let byte = 0; byte <= 255; byte++) {
      const hex = `#336699${byte.toString(16).padStart(2, "0").toUpperCase()}`;
      const color = parseColor(hex)!;
      expect(formatColor(color, true)).toBe(hex);
    }
  });

  it("handles hue 360 like hue 0", () => {
    expect(hsbToHex(360, 100, 100)).toBe(hsbToHex(0, 100, 100));
  });
});

describe("hue preservation", () => {
  it.each(["#808080", "#000000", "#FFFFFF"])("keeps the fallback hue for %s", (hex) => {
    expect(hexToHsb(hex, 210).h).toBe(210);
    expect(parseColor(hex, 210)!.h).toBe(210);
  });

  it("ignores the fallback hue for saturated colors", () => {
    expect(rgbToHsb({ r: 255, g: 0, b: 0 }, 210).h).toBe(0);
  });
});

describe("alpha helpers", () => {
  it("parses alpha as 0–100", () => {
    expect(parseAlphaFromHex("#000000FF")).toBe(100);
    expect(parseAlphaFromHex("#00000000")).toBe(0);
    expect(parseAlphaFromHex("#000000")).toBe(100);
    expect(parseAlphaFromHex("#0008")).toBeCloseTo((0x88 / 255) * 100);
  });

  it("appends alpha", () => {
    expect(appendAlphaToHex("#336699", 50)).toBe("#33669980");
    expect(appendAlphaToHex("336699", 100)).toBe("#336699FF");
    expect(appendAlphaToHex("#336699AA", 0)).toBe("#33669900");
  });

  it("formats rgba()", () => {
    expect(hexToRgba("#336699", 50)).toBe("rgba(51, 102, 153, 0.5)");
  });

  it("formatColor omits alpha unless requested", () => {
    const c = parseColor("#33669980")!;
    expect(formatColor(c, false)).toBe("#336699");
    expect(formatColor(c, true)).toBe("#33669980");
  });
});

describe("misc", () => {
  it("hexToRgb accepts shorthand and falls back to black", () => {
    expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("nope")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("parseColor rejects invalid input", () => {
    expect(parseColor("nope")).toBeNull();
  });

  it("picks readable contrast", () => {
    expect(getContrastColor("#FFFFFF")).toBe("#000000");
    expect(getContrastColor("#000000")).toBe("#FFFFFF");
    // Fully transparent black sits on the light checkerboard → dark text.
    expect(getContrastColor("#000000", 0)).toBe("#000000");
  });
});

describe("slider geometry", () => {
  it("maps positions to ratios with an inset", () => {
    expect(positionToRatio(0, 200, 20)).toBe(0);
    expect(positionToRatio(20, 200, 20)).toBe(0);
    expect(positionToRatio(100, 200, 20)).toBe(0.5);
    expect(positionToRatio(180, 200, 20)).toBe(1);
    expect(positionToRatio(999, 200, 20)).toBe(1);
    expect(positionToRatio(10, 0, 0)).toBe(0);
  });

  it("is the inverse of ratioToPosition", () => {
    for (const r of [0, 0.25, 0.5, 1]) {
      expect(positionToRatio(ratioToPosition(r, 300, 17), 300, 17)).toBeCloseTo(r);
    }
  });
});
