import { memo, useCallback } from "react";
import { View, type AccessibilityActionEvent } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { positionToRatio, useSliderGesture } from "../hooks/use-slider-gesture";
import { useSvgId } from "../hooks/use-svg-id";
import { hsbToHex } from "../utils/colors";
import { Thumb } from "./thumb";

const THUMB_SIZE = 24;
const A11Y_STEP = 5;
const RADIUS = 12;

type SatBrightPadProps = {
  hue: number;
  sat: number;
  bright: number;
  disabled: boolean;
  thumbBorder: string;
  saturationLabel: string;
  brightnessLabel: string;
  onChange: (vals: { s: number; b: number }) => void;
  onChangeEnd?: () => void;
};

/** Gradient background — re-renders only when the hue or size changes, not on every drag. */
const PadBackground = memo(function PadBackground({ hue, size }: { hue: number; size: number }) {
  const satId = useSvgId("sat");
  const brightId = useSvgId("bright");
  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id={satId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="1" stopColor={hsbToHex(hue, 100, 100)} stopOpacity={1} />
        </LinearGradient>
        <LinearGradient id={brightId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={size} height={size} rx={RADIUS} fill={`url(#${satId})`} />
      <Rect x="0" y="0" width={size} height={size} rx={RADIUS} fill={`url(#${brightId})`} />
    </Svg>
  );
});

const clamp100 = (v: number) => Math.min(100, Math.max(0, v));

export const SatBrightPad = memo(function SatBrightPad({
  hue,
  sat,
  bright,
  disabled,
  thumbBorder,
  saturationLabel,
  brightnessLabel,
  onChange,
  onChangeEnd,
}: SatBrightPadProps) {
  const { panHandlers, onLayout, width } = useSliderGesture({
    disabled,
    onMove: ({ x, y, width: w, height: h }) =>
      onChange({
        s: positionToRatio(x, w) * 100,
        b: (1 - positionToRatio(y, h)) * 100,
      }),
    onEnd: onChangeEnd,
  });

  const onAccessibilityAction = useCallback(
    (e: AccessibilityActionEvent) => {
      if (disabled) return;
      let s = sat;
      let b = bright;
      switch (e.nativeEvent.actionName) {
        case "increment":
          s = clamp100(s + A11Y_STEP);
          break;
        case "decrement":
          s = clamp100(s - A11Y_STEP);
          break;
        case "increaseBrightness":
          b = clamp100(b + A11Y_STEP);
          break;
        case "decreaseBrightness":
          b = clamp100(b - A11Y_STEP);
          break;
        default:
          return;
      }
      onChange({ s, b });
      onChangeEnd?.();
    },
    [disabled, sat, bright, onChange, onChangeEnd],
  );

  return (
    <View
      testID="color-picker-pad"
      onLayout={onLayout}
      style={{ width: "100%", aspectRatio: 1 }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`${saturationLabel}, ${brightnessLabel}`}
      accessibilityState={{ disabled }}
      accessibilityValue={{
        text: `${saturationLabel} ${Math.round(sat)}%, ${brightnessLabel} ${Math.round(bright)}%`,
      }}
      accessibilityActions={[
        { name: "increment", label: `+ ${saturationLabel}` },
        { name: "decrement", label: `- ${saturationLabel}` },
        { name: "increaseBrightness", label: `+ ${brightnessLabel}` },
        { name: "decreaseBrightness", label: `- ${brightnessLabel}` },
      ]}
      onAccessibilityAction={onAccessibilityAction}
      {...panHandlers}
    >
      {width > 0 && (
        // Not clipped, so the thumb can overhang the edges instead of being cut off in the corners.
        <View pointerEvents="none" style={{ flex: 1 }}>
          <PadBackground hue={hue} size={width} />
          <Thumb
            x={(sat / 100) * width}
            y={((100 - bright) / 100) * width}
            size={THUMB_SIZE}
            borderColor={thumbBorder}
            color={hsbToHex(hue, sat, bright)}
          />
        </View>
      )}
    </View>
  );
});
