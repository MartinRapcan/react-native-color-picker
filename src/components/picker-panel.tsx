import { memo } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorPickerLabels, ColorPickerTheme, TabId } from "../types/misc";
import type { Hsb, Rgb } from "../utils/colors";
import { ColorFill } from "./color-fill";
import { type ColorPalette, PalettesTab } from "./palettes-tab";
import { PickerTab } from "./picker-tab";
import { TabBar } from "./tab-bar";
import { ValuesTab } from "./values-tab";

const HEADER_HEIGHT = 64;

export type PickerPanelProps = {
  hue: number;
  sat: number;
  bright: number;
  /** Omit when alpha is disabled. */
  alpha?: number;
  /** `#RRGGBB` */
  currentHex: string;
  /** `#RRGGBB` or `#RRGGBBAA` — what `onChange` reports. */
  outputHex: string;
  contrastColor: string;
  savedColors: string[];
  tabs: readonly TabId[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hueStripHeight: number;
  disabled: boolean;
  t: ColorPickerTheme;
  labels: Required<ColorPickerLabels>;
  palettes?: ColorPalette[];
  confirmClear: boolean;
  onHueChange: (h: number) => void;
  onSatBrightChange: (vals: { s: number; b: number }) => void;
  onAlphaChange: (a: number) => void;
  onChangeEnd: () => void;
  onHexCommit: (hex: string) => void;
  onRgbCommit: (rgb: Rgb) => void;
  onHsbCommit: (hsb: Partial<Hsb>) => void;
  onAlphaCommit: (a: number) => void;
  onSaveColor: () => void;
  onSelectColor: (hex: string) => void;
  onClearSaved?: () => void;
  onRemoveSavedColor?: (hex: string) => void;
  style?: StyleProp<ViewStyle>;
};

export const PickerPanel = memo(function PickerPanel(props: PickerPanelProps) {
  const {
    alpha,
    currentHex,
    outputHex,
    contrastColor,
    tabs,
    activeTab,
    onTabChange,
    disabled,
    t,
    labels,
    onSaveColor,
    style,
  } = props;
  const lightText = contrastColor === "#FFFFFF";

  return (
    <View
      testID="color-picker-panel"
      style={[
        {
          backgroundColor: t.background,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: t.border,
        },
        style,
      ]}
    >
      {/* Color preview header */}
      <View style={{ height: HEADER_HEIGHT, overflow: "hidden" }}>
        <ColorFill
          color={currentHex}
          alpha={alpha}
          cellSize={8}
          style={{ justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 12 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text
              testID="color-picker-header-hex"
              selectable
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: contrastColor,
                fontVariant: ["tabular-nums"],
                letterSpacing: 0.5,
              }}
            >
              {outputHex.toUpperCase()}
            </Text>
            {tabs.includes("palettes") && (
              <Pressable
                testID="color-picker-save"
                onPress={onSaveColor}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`${labels.save} ${outputHex.toUpperCase()}`}
                style={({ pressed }) => ({
                  backgroundColor: pressed
                    ? lightText
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(0,0,0,0.5)"
                    : lightText
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(0,0,0,0.35)",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 8,
                  borderColor: contrastColor,
                  borderWidth: 1,
                })}
              >
                <Text style={{ color: contrastColor, fontSize: 12, fontWeight: "600" }}>{labels.save}</Text>
              </Pressable>
            )}
          </View>
        </ColorFill>
      </View>

      {tabs.length > 1 && (
        <TabBar tabs={tabs} active={activeTab} onSelect={onTabChange} t={t} labels={labels} />
      )}

      {activeTab === "picker" && (
        <PickerTab
          hue={props.hue}
          sat={props.sat}
          bright={props.bright}
          alpha={alpha}
          currentHex={currentHex}
          hueStripHeight={props.hueStripHeight}
          disabled={disabled}
          t={t}
          labels={labels}
          onHueChange={props.onHueChange}
          onSatBrightChange={props.onSatBrightChange}
          onAlphaChange={props.onAlphaChange}
          onChangeEnd={props.onChangeEnd}
        />
      )}
      {activeTab === "values" && (
        <ValuesTab
          hue={props.hue}
          sat={props.sat}
          bright={props.bright}
          alpha={alpha}
          currentHex={currentHex}
          outputHex={outputHex}
          disabled={disabled}
          t={t}
          labels={labels}
          onHexCommit={props.onHexCommit}
          onRgbCommit={props.onRgbCommit}
          onHsbCommit={props.onHsbCommit}
          onAlphaCommit={props.onAlphaCommit}
        />
      )}
      {activeTab === "palettes" && (
        <PalettesTab
          palettes={props.palettes}
          savedColors={props.savedColors}
          showAlpha={alpha != null}
          disabled={disabled}
          t={t}
          labels={labels}
          onSelect={props.onSelectColor}
          onClearSaved={props.onClearSaved}
          onRemoveSavedColor={props.onRemoveSavedColor}
          confirmClear={props.confirmClear}
        />
      )}
    </View>
  );
});
