import { memo, useCallback } from "react";
import { Text, TextInput, View } from "react-native";
import { useDraftInput } from "../hooks/use-draft-input";
import type { ColorPickerLabels, ColorPickerTheme } from "../types/misc";
import { hexToRgb, normalizeHex, type Hsb, type Rgb } from "../utils/colors";
import { ColorFill } from "./color-fill";

type ValuesTabProps = {
  hue: number;
  sat: number;
  bright: number;
  /** Omit when alpha is disabled. */
  alpha?: number;
  /** `#RRGGBB` of the current color. */
  currentHex: string;
  /** What the hex field shows: `#RRGGBB`, or `#RRGGBBAA` when alpha is on. */
  outputHex: string;
  disabled: boolean;
  t: ColorPickerTheme;
  labels: Required<ColorPickerLabels>;
  /** Receives a normalized `#RRGGBB` or `#RRGGBBAA`. */
  onHexCommit: (hex: string) => void;
  onRgbCommit: (rgb: Rgb) => void;
  onHsbCommit: (hsb: Partial<Hsb>) => void;
  onAlphaCommit: (alpha: number) => void;
};

type NumberFieldProps = {
  label: string;
  accessibilityLabel: string;
  labelColor: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  disabled: boolean;
  t: ColorPickerTheme;
  onCommit: (value: number) => void;
  testID?: string;
};

const NumberField = memo(function NumberField({
  label,
  accessibilityLabel,
  labelColor,
  value,
  min,
  max,
  suffix,
  disabled,
  t,
  onCommit,
  testID,
}: NumberFieldProps) {
  const display = String(Math.round(value));
  const commit = useCallback(
    (text: string) => {
      const n = parseFloat(text.replace(",", "."));
      if (Number.isNaN(n)) return; // invalid → field reverts to the current value
      onCommit(Math.min(max, Math.max(min, n)));
    },
    [min, max, onCommit],
  );
  const input = useDraftInput(display, commit);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.surface,
        borderRadius: 10,
        paddingTop: 10,
        paddingBottom: 4,
        alignItems: "center",
      }}
    >
      <Text
        style={{ color: labelColor, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}
        importantForAccessibility="no"
      >
        {label}
        {suffix ? ` ${suffix}` : ""}
      </Text>
      <TextInput
        testID={testID}
        {...input}
        editable={!disabled}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={3}
        selectTextOnFocus
        accessibilityLabel={accessibilityLabel}
        style={{
          width: "100%",
          textAlign: "center",
          color: t.text,
          fontSize: 20,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
          paddingVertical: 4,
        }}
      />
    </View>
  );
});

export const ValuesTab = memo(function ValuesTab({
  hue,
  sat,
  bright,
  alpha,
  currentHex,
  outputHex,
  disabled,
  t,
  labels,
  onHexCommit,
  onRgbCommit,
  onHsbCommit,
  onAlphaCommit,
}: ValuesTabProps) {
  const showAlpha = alpha != null;
  const rgb = hexToRgb(currentHex);

  const hexDisplay = outputHex.toUpperCase();
  const commitHex = useCallback(
    (text: string) => {
      const hex = normalizeHex(text);
      if (hex) onHexCommit(hex); // invalid → field reverts to the current value
    },
    [onHexCommit],
  );
  const hexInput = useDraftInput(hexDisplay, commitHex);

  const setR = useCallback(
    (r: number) => onRgbCommit({ ...hexToRgb(currentHex), r }),
    [currentHex, onRgbCommit],
  );
  const setG = useCallback(
    (g: number) => onRgbCommit({ ...hexToRgb(currentHex), g }),
    [currentHex, onRgbCommit],
  );
  const setB = useCallback(
    (b: number) => onRgbCommit({ ...hexToRgb(currentHex), b }),
    [currentHex, onRgbCommit],
  );
  const setH = useCallback((h: number) => onHsbCommit({ h }), [onHsbCommit]);
  const setS = useCallback((s: number) => onHsbCommit({ s }), [onHsbCommit]);
  const setV = useCallback((b: number) => onHsbCommit({ b }), [onHsbCommit]);

  const common = { disabled, t };

  return (
    <View style={{ padding: 20, gap: 16 }}>
      {/* Hex input */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          testID="color-picker-hex-input"
          {...hexInput}
          // 8 digits when alpha is on; 3/4-digit shorthand is accepted too.
          maxLength={showAlpha ? 9 : 7}
          autoCapitalize="characters"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="done"
          editable={!disabled}
          accessibilityLabel={labels.hex}
          style={{
            flex: 1,
            backgroundColor: t.inputBg,
            borderWidth: 1,
            borderColor: t.border,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: t.text,
            fontSize: 16,
            fontWeight: "500",
            fontVariant: ["tabular-nums"],
          }}
        />
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <ColorFill color={currentHex} alpha={alpha} />
        </View>
      </View>

      {/* RGB(A) */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <NumberField
          testID="color-picker-r"
          label="R"
          accessibilityLabel={labels.red}
          labelColor="#FF6B6B"
          value={rgb.r}
          min={0}
          max={255}
          onCommit={setR}
          {...common}
        />
        <NumberField
          testID="color-picker-g"
          label="G"
          accessibilityLabel={labels.green}
          labelColor="#51CF66"
          value={rgb.g}
          min={0}
          max={255}
          onCommit={setG}
          {...common}
        />
        <NumberField
          testID="color-picker-b"
          label="B"
          accessibilityLabel={labels.blue}
          labelColor="#339AF0"
          value={rgb.b}
          min={0}
          max={255}
          onCommit={setB}
          {...common}
        />
        {showAlpha && (
          <NumberField
            testID="color-picker-a"
            label="A"
            suffix="%"
            accessibilityLabel={labels.alpha}
            labelColor="#868E96"
            value={alpha}
            min={0}
            max={100}
            onCommit={onAlphaCommit}
            {...common}
          />
        )}
      </View>

      {/* HSB */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <NumberField
          testID="color-picker-h"
          label="H"
          suffix="°"
          accessibilityLabel={labels.hue}
          labelColor={t.textMuted}
          value={hue}
          min={0}
          max={360}
          onCommit={setH}
          {...common}
        />
        <NumberField
          testID="color-picker-s"
          label="S"
          suffix="%"
          accessibilityLabel={labels.saturation}
          labelColor={t.textMuted}
          value={sat}
          min={0}
          max={100}
          onCommit={setS}
          {...common}
        />
        <NumberField
          testID="color-picker-v"
          label="B"
          suffix="%"
          accessibilityLabel={labels.brightness}
          labelColor={t.textMuted}
          value={bright}
          min={0}
          max={100}
          onCommit={setV}
          {...common}
        />
        {showAlpha && (
          <NumberField
            label="A"
            suffix="%"
            accessibilityLabel={labels.alpha}
            labelColor={t.textMuted}
            value={alpha}
            min={0}
            max={100}
            onCommit={onAlphaCommit}
            {...common}
          />
        )}
      </View>
    </View>
  );
});
