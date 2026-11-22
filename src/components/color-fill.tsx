import { memo, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";
import { useSvgId } from "../hooks/use-svg-id";
import { CHECKER_DARK, CHECKER_LIGHT } from "../shared/const";
import { hexToRgba } from "../utils/colors";

type CheckerboardProps = {
  /** Size of one checker cell in px (default 6). */
  cellSize?: number;
  style?: StyleProp<ViewStyle>;
};

/** Transparency checkerboard that fills its parent (absolutely positioned). */
export const Checkerboard = memo(function Checkerboard({ cellSize = 6, style }: CheckerboardProps) {
  const id = useSvgId("checker");
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={id}
            x="0"
            y="0"
            width={cellSize * 2}
            height={cellSize * 2}
            patternUnits="userSpaceOnUse"
          >
            <Rect x="0" y="0" width={cellSize} height={cellSize} fill={CHECKER_DARK} />
            <Rect x={cellSize} y="0" width={cellSize} height={cellSize} fill={CHECKER_LIGHT} />
            <Rect x="0" y={cellSize} width={cellSize} height={cellSize} fill={CHECKER_LIGHT} />
            <Rect x={cellSize} y={cellSize} width={cellSize} height={cellSize} fill={CHECKER_DARK} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
});

type ColorFillProps = {
  /** `#RRGGBB` (alpha is passed separately). */
  color: string;
  /** 0–100. A checkerboard is drawn underneath when < 100. */
  alpha?: number;
  cellSize?: number;
  /** Style of the color layer (e.g. padding / alignment for children). */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Fills its parent with a (possibly translucent) color. Replaces the
 * checkerboard + overlay markup that used to be copied into every swatch.
 */
export function ColorFill({ color, alpha = 100, cellSize, style, children }: ColorFillProps) {
  const translucent = alpha < 100;
  return (
    <>
      {translucent && <Checkerboard cellSize={cellSize} />}
      <View
        pointerEvents={children ? "box-none" : "none"}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: translucent ? hexToRgba(color, alpha) : color },
          style,
        ]}
      >
        {children}
      </View>
    </>
  );
}
