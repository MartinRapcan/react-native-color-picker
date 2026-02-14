import { useState } from "react";
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle
} from "react-native";
import type { ColorPickerLabels, TabId, Theme } from "../types/misc";
import { PickerTab } from "./picker-tab";
import { RecentTab } from "./recent-tab";
import { TabBar } from "./tab-bar";
import { ValuesTab } from "./values-tab";

type PickerPanelProps = {
  hue: number;
  sat: number;
  bright: number;
  currentHex: string;
  contrastColor: string;
  hexInput: string;
  recentColors: string[];
  tabs: TabId[];
  hueStripHeight: number;
  disabled: boolean;
  t: Theme;
  labels: Required<ColorPickerLabels>;
  onHueChange: (h: number) => void;
  onSatBrightChange: (vals: { s: number; b: number }) => void;
  onHexInputChange: (text: string) => void;
  onHexSubmit: () => void;
  onHexInputFocus: () => void;
  onHexInputBlur: () => void;
  onSaveRecent: () => void;
  onRecentSelect: (hex: string) => void;
  onClearRecent: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PickerPanel({
  hue,
  sat,
  bright,
  currentHex,
  contrastColor,
  hexInput,
  recentColors,
  tabs,
  hueStripHeight,
  disabled,
  t,
  onHueChange,
  onSatBrightChange,
  onHexInputChange,
  onHexSubmit,
  onHexInputFocus,
  onHexInputBlur,
  onSaveRecent,
  onRecentSelect,
  onClearRecent,
  labels,
  style,
}: PickerPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]!);

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
          backgroundColor: currentHex,
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
            {currentHex.toUpperCase()}
          </Text>
          <Pressable
            onPress={onSaveRecent}
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? contrastColor === "#FFFFFF"
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(0,0,0,0.3)"
                : contrastColor === "#FFFFFF"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)",
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 8,
            })}
          >
            <Text
              style={{ color: contrastColor, fontSize: 12, fontWeight: "600" }}
            >
              {labels.save}
            </Text>
          </Pressable>
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
          hueStripHeight={hueStripHeight}
          disabled={disabled}
          t={t}
          onHueChange={onHueChange}
          onSatBrightChange={onSatBrightChange}
        />
      )}
      {activeTab === "values" && (
        <ValuesTab
          hue={hue}
          sat={sat}
          bright={bright}
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
      {activeTab === "recent" && (
        <RecentTab
          recentColors={recentColors}
          disabled={disabled}
          t={t}
          labels={labels}
          onSelect={onRecentSelect}
          onClear={onClearRecent}
        />
      )}
    </View>
  );
}