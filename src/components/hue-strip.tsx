import { memo, useCallback } from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSvgId } from "../hooks/use-svg-id";
import { hsbToHex } from "../utils/colors";
import { Slider } from "./slider";

const HUE_STOPS = ["#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF", "#FF0000"];

type HueStripProps = {
  hue: number;
  height: number;
  disabled: boolean;
  thumbBorder: string;
  label: string;
  onChange: (hue: number) => void;
  onChangeEnd?: () => void;
};

export const HueStrip = memo(function HueStrip({
  hue,
  height,
  disabled,
  thumbBorder,
  label,
  onChange,
  onChangeEnd,
}: HueStripProps) {
  const gradId = useSvgId("hue");

  const renderTrack = useCallback(
    (width: number, h: number, inset: number) => (
      <Svg width={width} height={h}>
        <Defs>
          {/* The gradient spans only the thumb's range, so the colour under the thumb's centre is exact. */}
          <LinearGradient
            id={gradId}
            x1={inset}
            y1="0"
            x2={width - inset}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            {HUE_STOPS.map((color, i) => (
              <Stop key={i} offset={i / (HUE_STOPS.length - 1)} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={h} rx={h / 2} fill={`url(#${gradId})`} />
      </Svg>
    ),
    [gradId],
  );

  return (
    <Slider
      testID="color-picker-hue"
      value={hue}
      min={0}
      max={360}
      step={5}
      height={height}
      disabled={disabled}
      thumbBorder={thumbBorder}
      thumbColor={hsbToHex(hue, 100, 100)}
      label={label}
      valueText={`${Math.round(hue)}°`}
      renderTrack={renderTrack}
      onChange={onChange}
      onChangeEnd={onChangeEnd}
    />
  );
});
