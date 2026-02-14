import {
  Pressable,
  Text,
  View
} from "react-native";
import type { ColorPickerLabels, TabId, Theme } from "../types/misc";

type TabBarProps = {
  tabs: TabId[];
  active: TabId;
  onSelect: (tab: TabId) => void;
  t: Theme;
  labels: Required<ColorPickerLabels>;
}

export function TabBar({
  tabs,
  active,
  onSelect,
  t,
  labels,
}: TabBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelect(tab)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: isActive ? t.tabIndicator : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isActive ? t.tabActive : t.tabInactive,
              }}
            >
              {labels[tab]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}