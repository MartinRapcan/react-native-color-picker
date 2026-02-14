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

type SatBrightPadProps = {
  hue: number;
  sat: number;
  bright: number;
  disabled: boolean;
  thumbBorder: string;
  onChange: (vals: { s: number; b: number }) => void;
}

export function SatBrightPad({
  hue,
  sat,
  bright,
  disabled,
  thumbBorder,
  onChange,
}: SatBrightPadProps) {
  const containerRef = useRef<React.ComponentRef<typeof View>>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef(0);
  const disabledRef = useRef(disabled);
  const onChangeRef = useRef(onChange);
  disabledRef.current = disabled;
  onChangeRef.current = onChange;

  const [layoutSize, setLayoutSize] = useState(0);

  const calcValues = useCallback((pageX: number, pageY: number) => {
    const s = sizeRef.current;
    if (!originRef.current || s === 0) return null;
    const x = Math.max(0, Math.min(pageX - originRef.current.x, s));
    const y = Math.max(0, Math.min(pageY - originRef.current.y, s));
    return {
      s: Math.round((x / s) * 100),
      b: Math.round(100 - (y / s) * 100),
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onStartShouldSetPanResponderCapture: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponderCapture: () => !disabledRef.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        containerRef.current?.measure((_x: number, _y: number, w: number, _h: number, ox: number, oy: number) => {
          originRef.current = { x: ox, y: oy };
          sizeRef.current = w;
          const vals = calcValues(pageX, pageY);
          if (vals) onChangeRef.current(vals);
        });
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const vals = calcValues(pageX, pageY);
        if (vals) onChangeRef.current(vals);
      },
    }),
  ).current;

  const thumbX = (sat / 100) * layoutSize;
  const thumbY = ((100 - bright) / 100) * layoutSize;
  const currentColor = hsbToHex(hue, sat, bright);
  const hueColor = hsbToHex(hue, 100, 100);

  return (
    <View
      ref={containerRef}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        setLayoutSize(w);
        sizeRef.current = w;
      }}
      style={{
        width: "100%",
        aspectRatio: 1,
        borderRadius: 12,
        overflow: "hidden",
      }}
      {...panResponder.panHandlers}
    >
      {layoutSize > 0 && (
        <>
          <Svg
            width={layoutSize}
            height={layoutSize}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <Defs>
              <LinearGradient id="grad_sat" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
                <Stop offset="1" stopColor={hueColor} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={layoutSize}
              height={layoutSize}
              fill="url(#grad_sat)"
            />
          </Svg>
          <Svg
            width={layoutSize}
            height={layoutSize}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <Defs>
              <LinearGradient id="grad_bright" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity={0} />
                <Stop offset="1" stopColor="#000000" stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={layoutSize}
              height={layoutSize}
              fill="url(#grad_bright)"
            />
          </Svg>
          <View
            style={{
              position: "absolute",
              left: thumbX - 12,
              top: thumbY - 12,
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 3,
              borderColor: thumbBorder,
              backgroundColor: currentColor,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 5,
            }}
          />
        </>
      )}
    </View>
  );
}