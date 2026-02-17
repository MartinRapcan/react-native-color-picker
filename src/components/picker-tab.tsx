import {
  View
} from "react-native";
import type { Theme } from "../types/misc";
import { AlphaStrip } from "./alpha-strip";
import { HueStrip } from "./hue-strip";
import { SatBrightPad } from "./sat-bright-pad";

type PickerTabProps = {
  hue: number;
  sat: number;
  bright: number;
  alpha?: number;
  currentHex: string;
  hueStripHeight: number;
  disabled: boolean;
  t: Theme;
  onHueChange: (h: number) => void;
  onSatBrightChange: (vals: { s: number; b: number }) => void;
  onAlphaChange?: (a: number) => void;
}

export function PickerTab({
  hue,
  sat,
  bright,
  alpha,
  currentHex,
  hueStripHeight,
  disabled,
  t,
  onHueChange,
  onSatBrightChange,
  onAlphaChange,
}: PickerTabProps) {
  return (
    <View style={{ gap: 16, padding: 20 }}>
      <SatBrightPad
        hue={hue}
        sat={sat}
        bright={bright}
        disabled={disabled}
        thumbBorder={t.thumbBorder}
        onChange={onSatBrightChange}
      />
      <HueStrip
        hue={hue}
        height={hueStripHeight}
        disabled={disabled}
        thumbBorder={t.thumbBorder}
        onChange={onHueChange}
      />
      {alpha != null && onAlphaChange && (
        <AlphaStrip
          alpha={alpha}
          color={currentHex}
          height={hueStripHeight}
          disabled={disabled}
          thumbBorder={t.thumbBorder}
          onChange={onAlphaChange}
        />
      )}
    </View>
  );
}