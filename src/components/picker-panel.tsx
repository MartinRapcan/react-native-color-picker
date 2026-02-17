import { useState } from "react";
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle
} from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";
import type { ColorPickerLabels, TabId, Theme } from "../types/misc";
import { appendAlphaToHex, hexToRgba } from "../utils/colors";
import { type ColorPalette, PalettesTab } from "./palettes-tab";
import { PickerTab } from "./picker-tab";
import { TabBar } from "./tab-bar";
import { ValuesTab } from "./values-tab";

type PickerPanelProps = {
  hue: number;
  sat: number;
  bright: number;
  alpha?: number;
  currentHex: string;
  contrastColor: string;
  hexInput: string;
  savedColors: string[];
  tabs: TabId[];
  hueStripHeight: number;
  disabled: boolean;
  t: Theme;
  labels: Required<ColorPickerLabels>;
  onHueChange: (h: number) => void;
  onSatBrightChange: (vals: { s: number; b: number }) => void;
  onAlphaChange?: (a: number) => void;
  onHexInputChange: (text: string) => void;
  onHexSubmit: () => void;
  onHexInputFocus: () => void;
  onHexInputBlur: () => void;
  onSaveColor: () => void;
  onSelectColor: (hex: string) => void;
  onClearSaved?: () => void;
  palettes?: ColorPalette[];
  style?: StyleProp<ViewStyle>;
}

export function PickerPanel({
  hue,
  sat,
  bright,
  alpha,
  currentHex,
  contrastColor,
  hexInput,
  savedColors,
  tabs,
  hueStripHeight,
  disabled,
  t,
  onHueChange,
  onSatBrightChange,
  onAlphaChange,
  onHexInputChange,
  onHexSubmit,
  onHexInputFocus,
  onHexInputBlur,
  onSaveColor,
  onSelectColor,
  onClearSaved,
  palettes,
  labels,
  style,
}: PickerPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]!);
  const showAlpha = alpha != null;
  const displayHex = showAlpha ? appendAlphaToHex(currentHex, alpha) : currentHex;
  const headerBgColor = showAlpha ? hexToRgba(currentHex, alpha) : currentHex;
  const checkerSize = 8;

  return (
    <View
      style={[
        { backgroundColor: t.background, borderRadius: 20, overflow: "hidden" },
        style,
      ]}
    >
      {/* Color preview header */}
      <View
        style={{
          height: 64,
          overflow: "hidden",
        }}
      >
        {/* Checkerboard background for alpha */}
        {showAlpha && (
          <Svg
            width="100%"
            height={64}
            style={{ position: "absolute" }}
          >
            <Defs>
              <Pattern
                id="headerChecker"
                x="0"
                y="0"
                width={checkerSize * 2}
                height={checkerSize * 2}
                patternUnits="userSpaceOnUse"
              >
                <Rect x="0" y="0" width={checkerSize} height={checkerSize} fill="#CCCCCC" />
                <Rect x={checkerSize} y="0" width={checkerSize} height={checkerSize} fill="#FFFFFF" />
                <Rect x="0" y={checkerSize} width={checkerSize} height={checkerSize} fill="#FFFFFF" />
                <Rect x={checkerSize} y={checkerSize} width={checkerSize} height={checkerSize} fill="#CCCCCC" />
              </Pattern>
            </Defs>
            <Rect x="0" y="0" width="100%" height={64} fill="url(#headerChecker)" />
          </Svg>
        )}
        {/* Color overlay */}
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: headerBgColor,
            justifyContent: "flex-end",
            paddingHorizontal: 16,
            paddingBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: contrastColor,
                fontVariant: ["tabular-nums"],
                letterSpacing: 0.5,
              }}
            >
              {displayHex.toUpperCase()}
            </Text>
            {tabs.includes("palettes") && (
              <Pressable
                onPress={onSaveColor}
                style={({ pressed }) => ({
                  backgroundColor: pressed
                    ? contrastColor === "#FFFFFF"
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(0,0,0,0.5)"
                    : contrastColor === "#FFFFFF"
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(0,0,0,0.35)",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 8,
                  borderColor: contrastColor,
                  borderWidth: 1,
                })}
              >
                <Text
                  style={{ color: contrastColor, fontSize: 12, fontWeight: "600" }}
                >
                  {labels.save}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Tab bar */}
      {tabs.length > 1 && (
        <TabBar
          tabs={tabs}
          active={activeTab}
          onSelect={setActiveTab}
          t={t}
          labels={labels}
        />
      )}

      {/* Tab content */}
      {activeTab === "picker" && (
        <PickerTab
          hue={hue}
          sat={sat}
          bright={bright}
          alpha={alpha}
          currentHex={currentHex}
          hueStripHeight={hueStripHeight}
          disabled={disabled}
          t={t}
          onHueChange={onHueChange}
          onSatBrightChange={onSatBrightChange}
          onAlphaChange={onAlphaChange}
        />
      )}
      {activeTab === "values" && (
        <ValuesTab
          hue={hue}
          sat={sat}
          bright={bright}
          alpha={alpha}
          currentHex={currentHex}
          hexInput={hexInput}
          disabled={disabled}
          t={t}
          onHexInputChange={onHexInputChange}
          onHexSubmit={onHexSubmit}
          onHexInputFocus={onHexInputFocus}
          onHexInputBlur={onHexInputBlur}
        />
      )}
      {activeTab === "palettes" && (
        <PalettesTab
          palettes={palettes}
          savedColors={savedColors}
          showAlpha={showAlpha}
          disabled={disabled}
          t={t}
          labels={labels}
          onSelect={onSelectColor}
          onClearSaved={onClearSaved}
        />
      )}
    </View>
  );
}