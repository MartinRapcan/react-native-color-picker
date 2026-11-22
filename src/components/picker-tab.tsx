import { memo } from "react";
import { View } from "react-native";
import type { ColorPickerLabels, ColorPickerTheme } from "../types/misc";
import { AlphaStrip } from "./alpha-strip";
import { HueStrip } from "./hue-strip";
import { SatBrightPad } from "./sat-bright-pad";

type PickerTabProps = {
  hue: number;
  sat: number;
  bright: number;
  /** Omit to hide the alpha slider. */
  alpha?: number;
  currentHex: string;
  hueStripHeight: number;
  disabled: boolean;
  t: ColorPickerTheme;
  labels: Required<ColorPickerLabels>;
  onHueChange: (h: number) => void;
  onSatBrightChange: (vals: { s: number; b: number }) => void;
  onAlphaChange: (a: number) => void;
  onChangeEnd: () => void;
};

export const PickerTab = memo(function PickerTab({
  hue,
  sat,
  bright,
  alpha,
  currentHex,
  hueStripHeight,
  disabled,
  t,
  labels,
  onHueChange,
  onSatBrightChange,
  onAlphaChange,
  onChangeEnd,
}: PickerTabProps) {
  return (
    <View style={{ gap: 16, padding: 20 }}>
      <SatBrightPad
        hue={hue}
        sat={sat}
        bright={bright}
        disabled={disabled}
        thumbBorder={t.thumbBorder}
        saturationLabel={labels.saturation}
        brightnessLabel={labels.brightness}
        onChange={onSatBrightChange}
        onChangeEnd={onChangeEnd}
      />
      <HueStrip
        hue={hue}
        height={hueStripHeight}
        disabled={disabled}
        thumbBorder={t.thumbBorder}
        label={labels.hue}
        onChange={onHueChange}
        onChangeEnd={onChangeEnd}
      />
      {alpha != null && (
        <AlphaStrip
          alpha={alpha}
          color={currentHex}
          height={hueStripHeight}
          disabled={disabled}
          thumbBorder={t.thumbBorder}
          label={labels.alpha}
          onChange={onAlphaChange}
          onChangeEnd={onChangeEnd}
        />
      )}
    </View>
  );
});
