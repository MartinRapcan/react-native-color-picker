import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";
import { PickerPanel } from "./picker-panel";
import type { ColorPickerLabels, ColorPickerRef, TabId } from "../types/misc";
import { DEFAULT_LABELS, themes } from "../shared/const";
import {
  appendAlphaToHex,
  getContrastColor,
  hexToHsb,
  hexToRgba,
  hsbToHex,
  isValidHex,
  parseAlphaFromHex,
} from "../utils/colors";
import type { ColorPalette } from "./palettes-tab";

export type ColorPickerProps = {
  /** Current color value (hex string, 6 or 8 digit) */
  value?: string;
  /** Called when color changes (returns #RRGGBB or #RRGGBBAA when showAlpha is true) */
  onChange?: (hex: string) => void;
  /** Tabs to show (default: ["picker", "values", "palettes"]) */
  tabs?: TabId[];
  /** Panel width in modal mode (default: 320). Accepts number or "100%". Ignored in inline mode. */
  panelWidth?: DimensionValue;
  /** Hue strip height (default: 28) */
  hueStripHeight?: number;
  /** Theme (default: "dark") */
  theme?: "light" | "dark";
  /** Disable touch input */
  disabled?: boolean;
  /** Style for the picker panel */
  style?: StyleProp<ViewStyle>;
  /** Swatch size (default: 48) */
  swatchSize?: number;
  /** Swatch border radius (default: 12) */
  swatchBorderRadius?: number;
  /** Style for the swatch trigger */
  swatchStyle?: StyleProp<ViewStyle>;
  /** Render inline instead of modal (default: false) */
  inline?: boolean;
  /** Override default labels for i18n */
  labels?: ColorPickerLabels;
  /** Style for content wrapper */
  contentStyle?: StyleProp<ViewStyle>;
  /** Show alpha channel strip (default: false) */
  showAlpha?: boolean;
  /** Color palettes for the palettes tab */
  palettes?: ColorPalette[];
  /** Saved colors (controlled) - if provided, component won't manage saved colors internally */
  savedColors?: string[];
  /** Called when user saves a color */
  onSaveColor?: (hex: string) => void;
  /** Called when user clears saved colors */
  onClearSaved?: () => void;
};

export const ColorPicker = React.forwardRef<ColorPickerRef, ColorPickerProps>(
  (
    {
      value = "#007AFF",
      onChange,
      tabs = ["picker", "values", "palettes"],
      panelWidth = "100%",
      hueStripHeight = 28,
      theme: themeName = "dark",
      disabled = false,
      style,
      swatchSize = 48,
      swatchBorderRadius = 12,
      swatchStyle,
      inline = false,
      labels: userLabels,
      contentStyle,
      showAlpha = false,
      palettes,
      savedColors: savedColorsProp,
      onSaveColor: onSaveColorProp,
      onClearSaved: onClearSavedProp,
    },
    ref,
  ) => {
    const t = themes[themeName];
    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const initial = hexToHsb(value);
    const [hue, setHue] = useState(initial.h);
    const [sat, setSat] = useState(initial.s);
    const [bright, setBright] = useState(initial.b);
    const [hexInput, setHexInput] = useState(value.toUpperCase());
    const [alpha, setAlpha] = useState(
      showAlpha ? parseAlphaFromHex(value) : 100,
    );
    // Internal saved colors state (used when not controlled)
    const [internalSavedColors, setInternalSavedColors] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Use controlled or internal saved colors
    const isControlled = savedColorsProp !== undefined;
    const savedColors = isControlled ? savedColorsProp : internalSavedColors;

    const currentHex = hsbToHex(hue, sat, bright);
    const contrastColor = getContrastColor(currentHex, showAlpha ? alpha : 100);

    // Refs for stable handler closures
    const hueRef = useRef(hue);
    const satRef = useRef(sat);
    const brightRef = useRef(bright);
    const alphaRef = useRef(alpha);
    hueRef.current = hue;
    satRef.current = sat;
    brightRef.current = bright;
    alphaRef.current = alpha;

    // Sync hex input display — only update when NOT focused
    const hexInputFocusedRef = useRef(false);
    const currentHexRef = useRef(currentHex);
    currentHexRef.current = currentHex;

    if (!hexInputFocusedRef.current && hexInput !== currentHex.toUpperCase()) {
      setHexInput(currentHex.toUpperCase());
    }

    // Sync from external value prop — only when parent actually changes value
    const lastExternalValue = useRef(value);
    if (value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      if (isValidHex(value)) {
        const hsb = hexToHsb(value);
        // Only update if actually different to avoid loops
        if (hsb.h !== hue || hsb.s !== sat || hsb.b !== bright) {
          setHue(hsb.h);
          setSat(hsb.s);
          setBright(hsb.b);
        }
        if (showAlpha) {
          const a = parseAlphaFromHex(value);
          if (a !== alpha) setAlpha(a);
        }
      }
    }

    const notifyChange = useCallback(
      (h: number, s: number, b: number, a?: number) => {
        const hex = hsbToHex(h, s, b);
        const result = showAlpha
          ? appendAlphaToHex(hex, a ?? alphaRef.current)
          : hex;
        lastExternalValue.current = result; // prevent sync-back
        onChange?.(result);
      },
      [onChange, showAlpha],
    );

    const handleSaveColor = useCallback(() => {
      const hex = showAlpha ? appendAlphaToHex(currentHex, alpha) : currentHex;
      if (isControlled) {
        onSaveColorProp?.(hex);
      } else {
        setInternalSavedColors((prev) => {
          if (prev.includes(hex)) return prev;
          return [hex, ...prev];
        });
      }
    }, [currentHex, alpha, showAlpha, isControlled, onSaveColorProp]);

    const handleClearSaved = useCallback(() => {
      if (isControlled) {
        onClearSavedProp?.();
      } else {
        setInternalSavedColors([]);
      }
    }, [isControlled, onClearSavedProp]);

    const handleHueChange = useCallback(
      (h: number) => {
        setHue(h);
        notifyChange(h, satRef.current, brightRef.current);
      },
      [notifyChange],
    );

    const handleSatBrightChange = useCallback(
      ({ s, b }: { s: number; b: number }) => {
        setSat(s);
        setBright(b);
        notifyChange(hueRef.current, s, b);
      },
      [notifyChange],
    );

    const handleAlphaChange = useCallback(
      (a: number) => {
        setAlpha(a);
        notifyChange(hueRef.current, satRef.current, brightRef.current, a);
      },
      [notifyChange],
    );

    const handleHexSubmit = useCallback(() => {
      const clean = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
      if (isValidHex(clean)) {
        const hsb = hexToHsb(clean);
        setHue(hsb.h);
        setSat(hsb.s);
        setBright(hsb.b);
        notifyChange(hsb.h, hsb.s, hsb.b);
      } else {
        setHexInput(currentHex.toUpperCase());
      }
    }, [hexInput, currentHex, notifyChange]);

    const handleSelectColor = useCallback(
      (hex: string) => {
        const hsb = hexToHsb(hex);
        setHue(hsb.h);
        setSat(hsb.s);
        setBright(hsb.b);
        if (showAlpha) {
          const a = parseAlphaFromHex(hex);
          setAlpha(a);
          notifyChange(hsb.h, hsb.s, hsb.b, a);
        } else {
          notifyChange(hsb.h, hsb.s, hsb.b);
        }
      },
      [notifyChange, showAlpha],
    );

    useImperativeHandle(
      ref,
      () => ({
        getColor: () => currentHex,
        setColor: (hex: string) => {
          if (!isValidHex(hex)) return;
          const hsb = hexToHsb(hex);
          setHue(hsb.h);
          setSat(hsb.s);
          setBright(hsb.b);
          lastExternalValue.current = hex;
          notifyChange(hsb.h, hsb.s, hsb.b);
        },
        clearSaved: () => handleClearSaved(),
        open: () => setModalVisible(true),
        close: () => setModalVisible(false),
      }),
      [currentHex, notifyChange, handleClearSaved],
    );

    const panelProps = {
      hue,
      sat,
      bright,
      ...(showAlpha ? { alpha, onAlphaChange: handleAlphaChange } : {}),
      currentHex,
      contrastColor,
      hexInput,
      savedColors,
      tabs,
      hueStripHeight,
      disabled,
      t,
      labels,
      onHueChange: handleHueChange,
      onSatBrightChange: handleSatBrightChange,
      onHexInputChange: setHexInput,
      onHexSubmit: handleHexSubmit,
      onHexInputFocus: () => {
        hexInputFocusedRef.current = true;
      },
      onHexInputBlur: () => {
        hexInputFocusedRef.current = false;
      },
      palettes,
      onSaveColor: handleSaveColor,
      onSelectColor: handleSelectColor,
      onClearSaved: isControlled ? onClearSavedProp : handleClearSaved,
    };

    if (inline) {
      return <PickerPanel {...panelProps} style={style} />;
    }

    const swatchColor = showAlpha ? hexToRgba(currentHex, alpha) : currentHex;
    const checkerSize = 6;

    return (
      <>
        <Pressable
          onPress={() => setModalVisible(true)}
          disabled={disabled}
          style={[
            {
              width: swatchSize,
              height: swatchSize,
              borderRadius: swatchBorderRadius,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: t.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            },
            swatchStyle,
          ]}
        >
          {showAlpha && (
            <Svg
              width={swatchSize}
              height={swatchSize}
              style={{ position: "absolute" }}
            >
              <Defs>
                <Pattern
                  id="swatchChecker"
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
              </Defs>
              <Rect
                x="0"
                y="0"
                width={swatchSize}
                height={swatchSize}
                fill="url(#swatchChecker)"
              />
            </Svg>
          )}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: swatchColor,
            }}
          />
        </Pressable>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: t.overlay,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            {/* Overlay pressable - absolute positioned behind content */}
            <Pressable
              onPress={() => setModalVisible(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            {/* Content - not wrapped in Pressable */}
            <View style={[{ width: "100%", alignItems: "center" }, contentStyle]}>
              <PickerPanel
                {...panelProps}
                style={[{ width: panelWidth }, style]}
              />
            </View>
          </View>
        </Modal>
      </>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
