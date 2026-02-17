import { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";
import type { ColorPickerLabels, Theme } from "../types/misc";
import { getContrastColor, hexToRgba, parseAlphaFromHex } from "../utils/colors";

// Color can be a simple hex string or an object with shades
export type ColorValue = string | Record<string, string>;

export type ColorPalette = {
  name: string;
  colors: Record<string, ColorValue>;
};

type PalettesTabProps = {
  palettes?: ColorPalette[];
  savedColors?: string[];
  showAlpha?: boolean;
  disabled: boolean;
  t: Theme;
  labels: Required<ColorPickerLabels>;
  onSelect: (hex: string) => void;
  onClearSaved?: () => void;
};

const SWATCH_SIZE = 56;
const GAP = 6;

// Check if a color value has shades
function hasShades(value: ColorValue): value is Record<string, string> {
  return typeof value === "object" && value !== null;
}

// Memoized swatch component
const ColorSwatch = memo(function ColorSwatch({
  name,
  hex,
  showAlpha,
  disabled,
  borderColor,
  onSelect,
}: {
  name?: string;
  hex: string;
  showAlpha?: boolean;
  disabled: boolean;
  borderColor: string;
  onSelect: (hex: string) => void;
}) {
  const colorAlpha = showAlpha ? parseAlphaFromHex(hex) : 100;
  const displayColor = showAlpha ? hexToRgba(hex, colorAlpha) : hex;
  const contrast = getContrastColor(hex, colorAlpha);

  return (
    <Pressable
      onPress={() => onSelect(hex)}
      disabled={disabled}
      style={({ pressed }) => ({
        width: SWATCH_SIZE,
        height: SWATCH_SIZE,
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor,
        opacity: pressed ? 0.7 : 1,
        justifyContent: "center",
        alignItems: "center",
      })}
    >
      {showAlpha && (
        <Svg width={SWATCH_SIZE} height={SWATCH_SIZE} style={{ position: "absolute" }}>
          <Defs>
            <Pattern
              id={`checker-${hex.replace("#", "")}`}
              x="0"
              y="0"
              width={10}
              height={10}
              patternUnits="userSpaceOnUse"
            >
              <Rect x="0" y="0" width={5} height={5} fill="#CCCCCC" />
              <Rect x={5} y="0" width={5} height={5} fill="#FFFFFF" />
              <Rect x="0" y={5} width={5} height={5} fill="#FFFFFF" />
              <Rect x={5} y={5} width={5} height={5} fill="#CCCCCC" />
            </Pattern>
          </Defs>
          <Rect x="0" y="0" width={SWATCH_SIZE} height={SWATCH_SIZE} fill={`url(#checker-${hex.replace("#", "")})`} />
        </Svg>
      )}
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: displayColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {name && (
          <Text
            style={{
              color: contrast,
              fontSize: 9,
              fontWeight: "600",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
        )}
      </View>
    </Pressable>
  );
});

// Row item type for FlatList
type RowItem =
  | { type: "saved-header" }
  | { type: "saved-colors"; colors: string[] }
  | { type: "saved-empty" }
  | { type: "simple"; colors: [string, string][] }
  | { type: "group"; name: string; shades: [string, string][] };

export function PalettesTab({
  palettes = [],
  savedColors = [],
  showAlpha,
  disabled,
  t,
  labels,
  onSelect,
  onClearSaved,
}: PalettesTabProps) {
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);

  // User palettes first, then "Saved" at the end
  const allPalettes = useMemo(() => {
    return [...palettes.map((p) => ({ ...p, isSaved: false })), { name: labels.saved, isSaved: true }];
  }, [palettes, labels.saved]);

  const activePalette = allPalettes[activePaletteIndex];

  // Memoize row data
  const rowData = useMemo(() => {
    if (!activePalette) return [];

    // Saved colors tab
    if (activePalette.isSaved) {
      if (savedColors.length === 0) {
        return [{ type: "saved-empty" as const }];
      }
      return [{ type: "saved-colors" as const, colors: savedColors }];
    }

    // Regular palette
    const palette = activePalette as ColorPalette & { isSaved: false };
    const simpleColors: [string, string][] = [];
    const colorGroups: [string, Record<string, string>][] = [];

    for (const [name, value] of Object.entries(palette.colors)) {
      if (hasShades(value)) {
        colorGroups.push([name, value]);
      } else {
        simpleColors.push([name, value]);
      }
    }

    const rows: RowItem[] = [];

    if (simpleColors.length > 0) {
      rows.push({ type: "simple", colors: simpleColors });
    }

    for (const [name, shades] of colorGroups) {
      rows.push({
        type: "group",
        name,
        shades: Object.entries(shades),
      });
    }

    return rows;
  }, [activePalette, savedColors]);

  const handleSelect = useCallback(
    (hex: string) => {
      onSelect(hex);
    },
    [onSelect]
  );

  const renderRow = useCallback(
    ({ item }: { item: RowItem }) => {
      if (item.type === "saved-empty") {
        return (
          <View style={{ padding: 20, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: t.textDim, fontSize: 14 }}>{labels.noSavedColors}</Text>
          </View>
        );
      }

      if (item.type === "saved-colors") {
        return (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
                {labels.saved}
              </Text>
              {onClearSaved && item.colors.length > 0 && (
                <Pressable onPress={onClearSaved}>
                  <Text style={{ color: t.textDim, fontSize: 12, fontWeight: "600" }}>
                    {labels.clearSaved}
                  </Text>
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
              {item.colors.map((hex, i) => (
                <ColorSwatch
                  key={`${hex}-${i}`}
                  name={showAlpha && hex.length === 9 ? hex.slice(1).toUpperCase() : hex.slice(1, 7).toUpperCase()}
                  hex={hex}
                  showAlpha={showAlpha}
                  disabled={disabled}
                  borderColor={t.border}
                  onSelect={handleSelect}
                />
              ))}
            </View>
          </View>
        );
      }

      if (item.type === "simple") {
        return (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
            {item.colors.map(([name, hex]) => (
              <ColorSwatch
                key={name}
                name={name}
                hex={hex}
                disabled={disabled}
                borderColor={t.border}
                onSelect={handleSelect}
              />
            ))}
          </View>
        );
      }

      if (item.type === "group") {
        return (
          <View style={{ gap: 6 }}>
            <Text
              style={{
                color: t.textMuted,
                fontSize: 11,
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {item.name}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: GAP }}
            >
              {item.shades.map(([shade, hex]) => (
                <ColorSwatch
                  key={shade}
                  name={shade}
                  hex={hex}
                  disabled={disabled}
                  borderColor={t.border}
                  onSelect={handleSelect}
                />
              ))}
            </ScrollView>
          </View>
        );
      }

      return null;
    },
    [disabled, showAlpha, t, labels, handleSelect, onClearSaved]
  );

  const keyExtractor = useCallback(
    (item: RowItem, index: number) => {
      if (item.type === "saved-header") return "saved-header";
      if (item.type === "saved-colors") return "saved-colors";
      if (item.type === "saved-empty") return "saved-empty";
      if (item.type === "simple") return "simple";
      if (item.type === "group") return `group-${item.name}-${index}`;
      return `row-${index}`;
    },
    []
  );

  return (
    <View>
      {/* Palette selector */}
      {allPalettes.length > 1 && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: t.border }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
          >
            {allPalettes.map((palette, index) => {
              const isActive = index === activePaletteIndex;
              return (
                <Pressable
                  key={palette.name}
                  onPress={() => setActivePaletteIndex(index)}
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
                      color: isActive ? (t.tabIndicator === "#FFFFFF" ? "#000000" : "#FFFFFF") : t.textMuted,
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

      {/* Colors grid - virtualized */}
      <View style={{ height: 280 }}>
        <FlatList
          data={rowData}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews
        />
      </View>
    </View>
  );
}
