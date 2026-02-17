import {
  Pressable,
  ScrollView,
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
  // 2-3 tabs: distribute evenly, 4+ tabs: scroll
  const useFlexLayout = tabs.length <= 3;

  const tabItems = tabs.map((tab) => {
    const isActive = tab === active;
    return (
      <Pressable
        key={tab}
        onPress={() => onSelect(tab)}
        style={{
          ...(useFlexLayout ? { flex: 1 } : { paddingHorizontal: 16 }),
          paddingVertical: 12,
          alignItems: "center",
          borderBottomWidth: 2,
          borderBottomColor: isActive ? t.tabIndicator : "transparent",
          justifyContent: "center",
          paddingHorizontal: 12
        }}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontSize: 13,
            fontWeight: "600",
            textAlign: "center",
            color: isActive ? t.tabActive : t.tabInactive,
          }}
        >
          {labels[tab]}
        </Text>
      </Pressable>
    );
  });

  if (useFlexLayout) {
    return (
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: t.border,
          width: "100%",
        }}
      >
        {tabItems}
      </View>
    );
  }

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: "row",
        }}
      >
        {tabItems}
      </ScrollView>
    </View>
  );
}