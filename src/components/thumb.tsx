import { memo } from "react";
import { View } from "react-native";
import { ColorFill } from "./color-fill";

type ThumbProps = {
  /** Centre of the thumb, relative to the parent. */
  x: number;
  y: number;
  size: number;
  borderColor: string;
  color: string;
  /** 0–100; shows a checkerboard inside the thumb when < 100. */
  alpha?: number;
};

export const Thumb = memo(function Thumb({ x, y, size, borderColor, color, alpha }: ThumbProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <View style={{ flex: 1, borderRadius: size / 2, overflow: "hidden" }}>
        <ColorFill color={color} alpha={alpha} cellSize={4} />
      </View>
    </View>
  );
});
