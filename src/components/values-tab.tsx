import {
  Text,
  TextInput,
  View
} from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";
import type { Theme } from "../types/misc";
import { hexToRgb, hexToRgba } from "../utils/colors";

type ValuesTabProps = {
  hue: number;
  sat: number;
  bright: number;
  alpha?: number;
  currentHex: string;
  hexInput: string;
  disabled: boolean;
  t: Theme;
  onHexInputChange: (text: string) => void;
  onHexSubmit: () => void;
  onHexInputFocus: () => void;
  onHexInputBlur: () => void;
}

export function ValuesTab({
  hue,
  sat,
  bright,
  alpha,
  currentHex,
  hexInput,
  disabled,
  t,
  onHexInputChange,
  onHexSubmit,
  onHexInputFocus,
  onHexInputBlur,
}: ValuesTabProps) {
  const showAlpha = alpha != null;
  const rgb = hexToRgb(currentHex);

  return (
    <View style={{ padding: 20, gap: 16 }}>
      {/* Hex input */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={hexInput}
          onChangeText={onHexInputChange}
          onBlur={() => {
            onHexInputBlur();
            onHexSubmit();
          }}
          onFocus={onHexInputFocus}
          onSubmitEditing={onHexSubmit}
          maxLength={7}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!disabled}
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
          {showAlpha && (
            <Svg width={48} height={48} style={{ position: "absolute" }}>
              <Defs>
                <Pattern
                  id="valuesChecker"
                  x="0"
                  y="0"
                  width={12}
                  height={12}
                  patternUnits="userSpaceOnUse"
                >
                  <Rect x="0" y="0" width={6} height={6} fill="#CCCCCC" />
                  <Rect x={6} y="0" width={6} height={6} fill="#FFFFFF" />
                  <Rect x="0" y={6} width={6} height={6} fill="#FFFFFF" />
                  <Rect x={6} y={6} width={6} height={6} fill="#CCCCCC" />
                </Pattern>
              </Defs>
              <Rect x="0" y="0" width={48} height={48} fill="url(#valuesChecker)" />
            </Svg>
          )}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: showAlpha ? hexToRgba(currentHex, alpha) : currentHex,
            }}
          />
        </View>
      </View>

      {/* RGB(A) */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          { label: "R", value: rgb.r, color: "#FF6B6B" },
          { label: "G", value: rgb.g, color: "#51CF66" },
          { label: "B", value: rgb.b, color: "#339AF0" },
          ...(showAlpha ? [{ label: "A", value: alpha, color: "#868E96" }] : []),
        ].map(({ label, value: val, color }) => (
          <View
            key={label}
            style={{
              flex: 1,
              backgroundColor: t.surface,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color,
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                color: t.text,
                fontSize: 20,
                fontWeight: "600",
                fontVariant: ["tabular-nums"],
                marginTop: 2,
              }}
            >
              {label === "A" ? `${val}%` : val}
            </Text>
          </View>
        ))}
      </View>

      {/* HSB(A) */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          { label: "H", value: `${hue}°` },
          { label: "S", value: `${sat}%` },
          { label: "B", value: `${bright}%` },
          ...(showAlpha ? [{ label: "A", value: `${alpha}%` }] : []),
        ].map(({ label, value: val }) => (
          <View
            key={label}
            style={{
              flex: 1,
              backgroundColor: t.surface,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: t.textMuted,
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                color: t.text,
                fontSize: 20,
                fontWeight: "600",
                fontVariant: ["tabular-nums"],
                marginTop: 2,
              }}
            >
              {val}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}