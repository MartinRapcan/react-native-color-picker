import { memo, useCallback } from "react";
import { View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSvgId } from "../hooks/use-svg-id";
import { Checkerboard } from "./color-fill";
import { Slider } from "./slider";

type AlphaStripProps = {
  /** 0–100 */
  alpha: number;
  /** `#RRGGBB` of the current color. */
  color: string;
  height: number;
  disabled: boolean;
  thumbBorder: string;
  label: string;
  onChange: (alpha: number) => void;
  onChangeEnd?: () => void;
};

export const AlphaStrip = memo(function AlphaStrip({
  alpha,
  color,
  height,
  disabled,
  thumbBorder,
  label,
  onChange,
  onChangeEnd,
}: AlphaStripProps) {
  const gradId = useSvgId("alpha");

  const renderTrack = useCallback(
    (width: number, h: number, inset: number) => (
      <View style={{ width, height: h, borderRadius: h / 2, overflow: "hidden" }}>
        <Checkerboard cellSize={5} />
        <Svg width={width} height={h}>
          <Defs>
            <LinearGradient
              id={gradId}
              x1={inset}
              y1="0"
              x2={width - inset}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset={0} stopColor={color} stopOpacity={0} />
              <Stop offset={1} stopColor={color} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={width} height={h} fill={`url(#${gradId})`} />
        </Svg>
      </View>
    ),
    [gradId, color],
  );

  return (
    <Slider
      testID="color-picker-alpha"
      value={alpha}
      min={0}
      max={100}
      step={5}
      height={height}
      disabled={disabled}
      thumbBorder={thumbBorder}
      thumbColor={color}
      thumbAlpha={alpha}
      label={label}
      valueText={`${Math.round(alpha)}%`}
      renderTrack={renderTrack}
      onChange={onChange}
      onChangeEnd={onChangeEnd}
    />
  );
});
