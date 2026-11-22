import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { ColorPickerLabels, ColorPickerTheme } from "../types/misc";
import { getContrastColor, normalizeHex, parseAlphaFromHex } from "../utils/colors";
import { ColorFill } from "./color-fill";

/** A plain hex string, or a group of named shades (e.g. `{ 100: "#…", 500: "#…" }`). */
export type ColorValue = string | Record<string, string>;

export type ColorPalette = {
  name: string;
  colors: Record<string, ColorValue>;
};

type PalettesTabProps = {
  palettes?: ColorPalette[];
  savedColors: string[];
  showAlpha: boolean;
  disabled: boolean;
  t: ColorPickerTheme;
  labels: Required<ColorPickerLabels>;
  onSelect: (hex: string) => void;
  /** Omit to hide the Clear button. */
  onClearSaved?: () => void;
  /** Omit to hide the remove badges. */
  onRemoveSavedColor?: (hex: string) => void;
  /** Require a second tap on Clear (default true). */
  confirmClear: boolean;
};

const SWATCH_SIZE = 56;
const GAP = 6;
const ROW_BATCH = 3;
const CONFIRM_TIMEOUT_MS = 3000;

function hasShades(value: ColorValue): value is Record<string, string> {
  return typeof value === "object" && value !== null;
}

type SwatchProps = {
  name?: string;
  hex: string;
  showAlpha: boolean;
  disabled: boolean;
  t: ColorPickerTheme;
  removeLabel: string;
  onSelect: (hex: string) => void;
  onRemove?: (hex: string) => void;
};

const ColorSwatch = memo(function ColorSwatch({
  name,
  hex,
  showAlpha,
  disabled,
  t,
  removeLabel,
  onSelect,
  onRemove,
}: SwatchProps) {
  const full = normalizeHex(hex) ?? "#000000";
  const rgbHex = full.slice(0, 7);
  const alpha = showAlpha ? parseAlphaFromHex(full) : 100;
  const contrast = getContrastColor(rgbHex, alpha);
  const spoken = name && name.toUpperCase() !== full.slice(1) ? `${name}, ${full}` : full;

  return (
    // Outer wrapper is not clipped, so the remove badge can overhang the swatch corner.
    <View style={{ width: SWATCH_SIZE, height: SWATCH_SIZE }}>
      <Pressable
        onPress={() => onSelect(hex)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={spoken}
        style={({ pressed }) => ({
          width: SWATCH_SIZE,
          height: SWATCH_SIZE,
          borderRadius: 8,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: t.border,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <ColorFill
          color={rgbHex}
          alpha={alpha}
          cellSize={5}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          {name ? (
            <Text
              style={{ color: contrast, fontSize: 9, fontWeight: "600", textAlign: "center" }}
              numberOfLines={1}
            >
              {name}
            </Text>
          ) : null}
        </ColorFill>
      </Pressable>
      {onRemove && (
        <Pressable
          onPress={() => onRemove(hex)}
          disabled={disabled}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${removeLabel} ${full}`}
          style={({ pressed }) => ({
            position: "absolute",
            top: -6,
            right: -6,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: pressed ? t.dangerPressed : t.danger,
            borderWidth: 1.5,
            borderColor: t.onDanger,
            justifyContent: "center",
            alignItems: "center",
          })}
        >
          <Text
            style={{
              color: t.onDanger,
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 13,
              includeFontPadding: false,
            }}
          >
            ×
          </Text>
        </Pressable>
      )}
    </View>
  );
});

type RowItem =
  | { type: "saved-colors"; colors: string[] }
  | { type: "saved-empty" }
  | { type: "simple"; colors: [string, string][] }
  | { type: "group"; name: string; shades: [string, string][] };

function rowKey(item: RowItem, index: number): string {
  return item.type === "group" ? `group-${index}-${item.name}` : item.type;
}

export const PalettesTab = memo(function PalettesTab({
  palettes = [],
  savedColors,
  showAlpha,
  disabled,
  t,
  labels,
  onSelect,
  onClearSaved,
  onRemoveSavedColor,
  confirmClear,
}: PalettesTabProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Progressive rendering: a few rows right away, the rest streamed across frames.
  // Keeps the tab switch snappy for big palettes (e.g. Tailwind) without a FlatList,
  // so the picker can still be nested inside a consumer's ScrollView.
  const [visibleCount, setVisibleCount] = useState(ROW_BATCH);
  const [armedClear, setArmedClear] = useState(false);

  // User palettes first, "Saved" last.
  const allPalettes = useMemo(
    () => [
      ...palettes.map((p) => ({ name: p.name, colors: p.colors, isSaved: false as const })),
      { name: labels.saved, isSaved: true as const },
    ],
    [palettes, labels.saved],
  );

  // Guard against the palettes prop shrinking while a later palette is selected.
  const safeIndex = Math.min(activeIndex, allPalettes.length - 1);
  const activePalette = allPalettes[safeIndex]!;

  const rows = useMemo<RowItem[]>(() => {
    if (activePalette.isSaved) {
      return savedColors.length === 0
        ? [{ type: "saved-empty" }]
        : [{ type: "saved-colors", colors: savedColors }];
    }
    const simple: [string, string][] = [];
    const result: RowItem[] = [];
    for (const [name, value] of Object.entries(activePalette.colors)) {
      if (hasShades(value)) {
        result.push({ type: "group", name, shades: Object.entries(value) });
      } else {
        simple.push([name, value]);
      }
    }
    if (simple.length > 0) result.unshift({ type: "simple", colors: simple });
    return result;
  }, [activePalette, savedColors]);

  useEffect(() => {
    setVisibleCount(ROW_BATCH);
  }, [safeIndex]);

  useEffect(() => {
    if (visibleCount >= rows.length) return;
    const raf = requestAnimationFrame(() => {
      setVisibleCount((c) => Math.min(c + ROW_BATCH, rows.length));
    });
    return () => cancelAnimationFrame(raf);
  }, [visibleCount, rows.length]);

  // Disarm the "Confirm?" state after a timeout.
  useEffect(() => {
    if (!armedClear) return;
    const timer = setTimeout(() => setArmedClear(false), CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [armedClear]);

  const handleClear = useCallback(() => {
    if (!onClearSaved) return;
    if (confirmClear && !armedClear) {
      setArmedClear(true);
      return;
    }
    setArmedClear(false);
    onClearSaved();
  }, [onClearSaved, confirmClear, armedClear]);

  const swatchCommon = { showAlpha, disabled, t, removeLabel: labels.removeColor, onSelect };

  const renderRow = (item: RowItem) => {
    switch (item.type) {
      case "saved-empty":
        return (
          <View style={{ padding: 20, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: t.textDim, fontSize: 14 }}>{labels.noSavedColors}</Text>
          </View>
        );
      case "saved-colors":
        return (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text
                accessibilityRole="header"
                style={{ color: t.textMuted, fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}
              >
                {labels.saved}
              </Text>
              {onClearSaved && (
                <Pressable
                  testID="color-picker-clear-saved"
                  onPress={handleClear}
                  disabled={disabled}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text style={{ color: armedClear ? t.danger : t.textDim, fontSize: 12, fontWeight: "600" }}>
                    {armedClear ? labels.confirmClear : labels.clearSaved}
                  </Text>
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
              {item.colors.map((hex) => {
                const full = normalizeHex(hex) ?? hex;
                const name = showAlpha && full.length === 9 ? full.slice(1) : full.slice(1, 7);
                return (
                  <ColorSwatch
                    key={hex}
                    name={name}
                    hex={hex}
                    onRemove={onRemoveSavedColor}
                    {...swatchCommon}
                  />
                );
              })}
            </View>
          </View>
        );
      case "simple":
        return (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
            {item.colors.map(([name, hex]) => (
              <ColorSwatch key={name} name={name} hex={hex} {...swatchCommon} />
            ))}
          </View>
        );
      case "group":
        return (
          <View style={{ gap: 6 }}>
            <Text
              accessibilityRole="header"
              style={{ color: t.textMuted, fontSize: 11, fontWeight: "600", textTransform: "capitalize" }}
            >
              {item.name}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: GAP }}
            >
              {item.shades.map(([shade, hex]) => (
                <ColorSwatch key={shade} name={shade} hex={hex} {...swatchCommon} />
              ))}
            </ScrollView>
          </View>
        );
    }
  };

  return (
    <View>
      {allPalettes.length > 1 && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: t.border }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
            accessibilityRole="tablist"
          >
            {allPalettes.map((palette, index) => {
              const isActive = index === safeIndex;
              return (
                <Pressable
                  key={`${index}-${palette.name}`}
                  onPress={() => setActiveIndex(index)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: isActive ? t.tabIndicator : t.surface,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: isActive ? t.tabActiveText : t.textMuted,
                    }}
                  >
                    {palette.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Plain ScrollView so consumers can nest the picker in their own scroll containers */}
      <ScrollView
        style={{ height: 280 }}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {rows.slice(0, visibleCount).map((item, index) => (
          <View key={rowKey(item, index)}>{renderRow(item)}</View>
        ))}
      </ScrollView>
    </View>
  );
});
