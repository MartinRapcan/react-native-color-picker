import { memo, useCallback, useMemo, type ReactNode } from "react";
import { View, type AccessibilityActionEvent } from "react-native";
import { positionToRatio, ratioToPosition, useSliderGesture } from "../hooks/use-slider-gesture";
import { Thumb } from "./thumb";

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  /** Step used by screen-reader increment/decrement actions. */
  step: number;
  height: number;
  disabled: boolean;
  thumbBorder: string;
  thumbColor: string;
  thumbAlpha?: number;
  /** Accessibility label, e.g. "Hue". */
  label: string;
  /** Spoken value, e.g. "210°". */
  valueText: string;
  /**
   * Draws the track. Must be memoized by the caller (useCallback), the result
   * is cached per size so dragging only re-renders the thumb.
   * `inset` is where the value range starts/ends on the x axis.
   */
  renderTrack: (width: number, height: number, inset: number) => ReactNode;
  onChange: (value: number) => void;
  onChangeEnd?: () => void;
  testID?: string;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Horizontal slider used for hue and alpha. */
export const Slider = memo(function Slider({
  value,
  min,
  max,
  step,
  height,
  disabled,
  thumbBorder,
  thumbColor,
  thumbAlpha,
  label,
  valueText,
  renderTrack,
  onChange,
  onChangeEnd,
  testID,
}: SliderProps) {
  const thumbSize = height + 6;
  const inset = thumbSize / 2;

  const { panHandlers, onLayout, width } = useSliderGesture({
    disabled,
    onMove: ({ x, width: w }) => onChange(min + positionToRatio(x, w, inset) * (max - min)),
    onEnd: onChangeEnd,
  });

  const track = useMemo(
    () => (width > 0 ? renderTrack(width, height, inset) : null),
    [renderTrack, width, height, inset],
  );

  const onAccessibilityAction = useCallback(
    (e: AccessibilityActionEvent) => {
      if (disabled) return;
      const dir =
        e.nativeEvent.actionName === "increment" ? 1 : e.nativeEvent.actionName === "decrement" ? -1 : 0;
      if (!dir) return;
      onChange(clamp(value + dir * step, min, max));
      onChangeEnd?.();
    },
    [disabled, value, step, min, max, onChange, onChangeEnd],
  );

  const ratio = max === min ? 0 : (value - min) / (max - min);

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      style={{ width: "100%", height }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      accessibilityValue={{ min, max, now: Math.round(value), text: valueText }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={onAccessibilityAction}
      {...panHandlers}
    >
      <View pointerEvents="none" style={{ flex: 1 }}>
        {track}
        {width > 0 && (
          <Thumb
            x={ratioToPosition(ratio, width, inset)}
            y={height / 2}
            size={thumbSize}
            borderColor={thumbBorder}
            color={thumbColor}
            alpha={thumbAlpha}
          />
        )}
      </View>
    </View>
  );
});
