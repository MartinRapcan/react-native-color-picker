import React, {
  useCallback,
  useRef,
  useState
} from "react";
import {
  PanResponder,
  View
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { hsbToHex } from "../utils/colors";

type HueStripProps = {
  hue: number;
  height: number;
  disabled: boolean;
  thumbBorder: string;
  onChange: (hue: number) => void;
}

export function HueStrip({
  hue,
  height,
  disabled,
  thumbBorder,
  onChange,
}: HueStripProps) {
  const containerRef = useRef<React.ComponentRef<typeof View>>(null);
  const originXRef = useRef(0);
  const widthRef = useRef(0);
  const disabledRef = useRef(disabled);
  const onChangeRef = useRef(onChange);
  disabledRef.current = disabled;
  onChangeRef.current = onChange;

  const [layoutWidth, setLayoutWidth] = useState(0);

  const calcHue = useCallback((pageX: number) => {
    const w = widthRef.current;
    if (w === 0) return 0;
    const x = Math.max(0, Math.min(pageX - originXRef.current, w));
    return Math.round((x / w) * 360);
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
        containerRef.current?.measure((_x: number, _y: number, w: number, _h: number, ox: number) => {
          originXRef.current = ox;
          widthRef.current = w;
          onChangeRef.current(calcHue(pageX));
        });
      },
      onPanResponderMove: (evt) => {
        onChangeRef.current(calcHue(evt.nativeEvent.pageX));
      },
    }),
  ).current;

  const hueColors = [
    "#FF0000",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#0000FF",
    "#FF00FF",
    "#FF0000",
  ];
  const thumbLeft = layoutWidth > 0 ? (hue / 360) * layoutWidth : 0;
  const thumbSize = height + 6;

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
              <LinearGradient id="hueGrad" x1="0" y1="0" x2="1" y2="0">
                {hueColors.map((color, i) => (
                  <Stop
                    key={i}
                    offset={`${(i / (hueColors.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={layoutWidth}
              height={height}
              rx={height / 2}
              fill="url(#hueGrad)"
            />
          </Svg>
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
              backgroundColor: hsbToHex(hue, 100, 100),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          />
        </>
      )}
    </View>
  );
}