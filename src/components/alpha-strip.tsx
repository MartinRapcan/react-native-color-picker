import type React from "react";
import { useCallback, useRef, useState } from "react";
import { PanResponder, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Pattern,
  Rect,
  Stop,
} from "react-native-svg";

type AlphaStripProps = {
  alpha: number;
  color: string;
  height: number;
  disabled: boolean;
  thumbBorder: string;
  onChange: (alpha: number) => void;
};

export function AlphaStrip({
  alpha,
  color,
  height,
  disabled,
  thumbBorder,
  onChange,
}: AlphaStripProps) {
  const containerRef = useRef<React.ComponentRef<typeof View>>(null);
  const originXRef = useRef(0);
  const widthRef = useRef(0);
  const disabledRef = useRef(disabled);
  const onChangeRef = useRef(onChange);
  disabledRef.current = disabled;
  onChangeRef.current = onChange;

  const [layoutWidth, setLayoutWidth] = useState(0);

  const calcAlpha = useCallback((pageX: number) => {
    const w = widthRef.current;
    if (w === 0) return 100;
    const x = Math.max(0, Math.min(pageX - originXRef.current, w));
    return Math.round((x / w) * 100);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onStartShouldSetPanResponderCapture: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponderCapture: () => !disabledRef.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const { pageX } = evt.nativeEvent;
        containerRef.current?.measure(
          (_x: number, _y: number, w: number, _h: number, ox: number) => {
            originXRef.current = ox;
            widthRef.current = w;
            onChangeRef.current(calcAlpha(pageX));
          },
        );
      },
      onPanResponderMove: (evt) => {
        onChangeRef.current(calcAlpha(evt.nativeEvent.pageX));
      },
    }),
  ).current;

  const thumbLeft = layoutWidth > 0 ? (alpha / 100) * layoutWidth : 0;
  const thumbSize = height + 6;
  const checkerSize = 5;

  return (
    <View
      ref={containerRef}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        setLayoutWidth(w);
        widthRef.current = w;
      }}
      style={{ width: "100%", height, overflow: "visible" }}
      {...panResponder.panHandlers}
    >
      {layoutWidth > 0 && (
        <>
          <Svg width={layoutWidth} height={height}>
            <Defs>
              <Pattern
                id="alphaChecker"
                x="0"
                y="0"
                width={checkerSize * 2}
                height={checkerSize * 2}
                patternUnits="userSpaceOnUse"
              >
                <Rect
                  x="0"
                  y="0"
                  width={checkerSize}
                  height={checkerSize}
                  fill="#CCCCCC"
                />
                <Rect
                  x={checkerSize}
                  y="0"
                  width={checkerSize}
                  height={checkerSize}
                  fill="#FFFFFF"
                />
                <Rect
                  x="0"
                  y={checkerSize}
                  width={checkerSize}
                  height={checkerSize}
                  fill="#FFFFFF"
                />
                <Rect
                  x={checkerSize}
                  y={checkerSize}
                  width={checkerSize}
                  height={checkerSize}
                  fill="#CCCCCC"
                />
              </Pattern>
              <LinearGradient id="alphaGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor={color} stopOpacity={0} />
                <Stop offset="100%" stopColor={color} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            {/* Checkerboard background */}
            <Rect
              x="0"
              y="0"
              width={layoutWidth}
              height={height}
              rx={height / 2}
              fill="url(#alphaChecker)"
            />
            {/* Alpha gradient overlay */}
            <Rect
              x="0"
              y="0"
              width={layoutWidth}
              height={height}
              rx={height / 2}
              fill="url(#alphaGrad)"
            />
          </Svg>
          {/* Thumb with checkerboard background for alpha visualization */}
          <View
            style={{
              position: "absolute",
              left: thumbLeft - thumbSize / 2,
              top: -3,
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              borderWidth: 3,
              borderColor: thumbBorder,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            {/* Checkerboard background */}
            <Svg
              width={thumbSize}
              height={thumbSize}
              style={{ position: "absolute" }}
            >
              <Defs>
                <Pattern
                  id="thumbChecker"
                  x="0"
                  y="0"
                  width={8}
                  height={8}
                  patternUnits="userSpaceOnUse"
                >
                  <Rect x="0" y="0" width={4} height={4} fill="#CCCCCC" />
                  <Rect x={4} y="0" width={4} height={4} fill="#FFFFFF" />
                  <Rect x="0" y={4} width={4} height={4} fill="#FFFFFF" />
                  <Rect x={4} y={4} width={4} height={4} fill="#CCCCCC" />
                </Pattern>
              </Defs>
              <Rect
                x="0"
                y="0"
                width={thumbSize}
                height={thumbSize}
                fill="url(#thumbChecker)"
              />
            </Svg>
            {/* Color overlay with actual alpha */}
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: color,
                opacity: alpha / 100,
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}
