import {
  Text,
  TextInput,
  View
} from "react-native";
import type { Theme } from "../types/misc";
import { hexToRgb } from "../utils/colors";

type ValuesTabProps = {
  hue: number;
  sat: number;
  bright: number;
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
  currentHex,
  hexInput,
  disabled,
  t,
  onHexInputChange,
  onHexSubmit,
  onHexInputFocus,
  onHexInputBlur,
}: ValuesTabProps) {
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
            backgroundColor: currentHex,
            borderWidth: 1,
            borderColor: t.border,
          }}
        />
      </View>

      {/* RGB */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          { label: "R", value: rgb.r, color: "#FF6B6B" },
          { label: "G", value: rgb.g, color: "#51CF66" },
          { label: "B", value: rgb.b, color: "#339AF0" },
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
              {val}
            </Text>
          </View>
        ))}
      </View>

      {/* HSB */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          { label: "H", value: `${hue}°` },
          { label: "S", value: `${sat}%` },
          { label: "B", value: `${bright}%` },
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