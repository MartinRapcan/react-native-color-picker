import {
  Pressable,
  Text,
  View
} from "react-native";
import type { ColorPickerLabels, Theme } from "../types/misc";

type RecentTabProps = {
  recentColors: string[];
  disabled: boolean;
  t: Theme;
  labels: Required<ColorPickerLabels>;
  onSelect: (hex: string) => void;
  onClear: () => void;
}

export function RecentTab({
  recentColors,
  disabled,
  t,
  labels,
  onSelect,
  onClear,
}: RecentTabProps) {
  if (recentColors.length === 0) {
    return (
      <View
        style={{
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
        }}
      >
        <Text style={{ color: t.textDim, fontSize: 14 }}>
          {labels.noSavedColors}
        </Text>
        <Text style={{ color: t.textDim, fontSize: 12, marginTop: 4 }}>
          {labels.noSavedColorsHint}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20, gap: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: t.textMuted,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {labels.savedColors}
        </Text>
        <Pressable onPress={onClear}>
          <Text style={{ color: t.textDim, fontSize: 12, fontWeight: "600" }}>
            {labels.clearAll}
          </Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {recentColors.map((c, i) => (
          <Pressable
            key={`${c}-${i}`}
            onPress={() => onSelect(c)}
            disabled={disabled}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: c,
              borderWidth: 1,
              borderColor: t.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}