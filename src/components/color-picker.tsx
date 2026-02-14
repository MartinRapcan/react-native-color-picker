import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  type DimensionValue,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { PickerPanel } from "./picker-panel";
import type { ColorPickerLabels, ColorPickerRef, TabId } from "../types/misc";
import { DEFAULT_LABELS, themes } from "../shared/const";
import { getContrastColor, hexToHsb, hsbToHex, isValidHex } from "../utils/colors";

export type ColorPickerProps = {
  /** Current color value (hex string) */
  value?: string;
  /** Called when color changes */
  onChange?: (hex: string) => void;
  /** Tabs to show (default: ["picker", "values", "recent"]) */
  tabs?: TabId[];
  /** Max recent colors (default: 16) */
  maxRecentColors?: number;
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
  /** Style for modal wrapper */
  modalStyle?: StyleProp<ViewStyle>;
};

export const ColorPicker = React.forwardRef<ColorPickerRef, ColorPickerProps>(
  (
    {
      value = "#007AFF",
      onChange,
      tabs = ["picker", "values", "recent"],
      maxRecentColors = 16,
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
      modalStyle,
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
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const currentHex = hsbToHex(hue, sat, bright);
    const contrastColor = getContrastColor(currentHex);

    // Refs for stable handler closures
    const hueRef = useRef(hue);
    const satRef = useRef(sat);
    const brightRef = useRef(bright);
    hueRef.current = hue;
    satRef.current = sat;
    brightRef.current = bright;

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
      }
    }

    const notifyChange = useCallback(
      (h: number, s: number, b: number) => {
        const hex = hsbToHex(h, s, b);
        lastExternalValue.current = hex; // prevent sync-back
        onChange?.(hex);
      },
      [onChange],
    );

    const addToRecent = useCallback(
      (hex: string) => {
        setRecentColors((prev) => {
          const filtered = prev.filter((c) => c !== hex);
          return [hex, ...filtered].slice(0, maxRecentColors);
        });
      },
      [maxRecentColors],
    );

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

    const handleHexSubmit = useCallback(() => {
      const clean = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
      if (isValidHex(clean)) {
        const hsb = hexToHsb(clean);
        setHue(hsb.h);
        setSat(hsb.s);
        setBright(hsb.b);
        notifyChange(hsb.h, hsb.s, hsb.b);
        addToRecent(clean);
      } else {
        setHexInput(currentHex.toUpperCase());
      }
    }, [hexInput, currentHex, notifyChange, addToRecent]);

    const handleRecentSelect = useCallback(
      (hex: string) => {
        const hsb = hexToHsb(hex);
        setHue(hsb.h);
        setSat(hsb.s);
        setBright(hsb.b);
        notifyChange(hsb.h, hsb.s, hsb.b);
      },
      [notifyChange],
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
        clearRecent: () => setRecentColors([]),
        open: () => setModalVisible(true),
        close: () => setModalVisible(false),
      }),
      [currentHex, notifyChange],
    );

    const panelProps = {
      hue,
      sat,
      bright,
      currentHex,
      contrastColor,
      hexInput,
      recentColors,
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
      onSaveRecent: () => addToRecent(currentHex),
      onRecentSelect: handleRecentSelect,
      onClearRecent: () => setRecentColors([]),
    };

    if (inline) {
      return <PickerPanel {...panelProps} style={style} />;
    }

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
              backgroundColor: currentHex,
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
        />

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            onPress={() => setModalVisible(false)}
            style={[
              {
                flex: 1,
                backgroundColor: t.overlay,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              },
              modalStyle,
            ]}
          >
            <Pressable
              onPress={() => {}}
              style={{ width: "100%", alignItems: "center" }}
            >
              <PickerPanel
                {...panelProps}
                style={[{ width: panelWidth }, style]}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
