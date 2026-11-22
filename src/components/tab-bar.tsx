import { memo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { ColorPickerLabels, ColorPickerTheme, TabId } from "../types/misc";

type TabBarProps = {
  tabs: readonly TabId[];
  active: TabId;
  onSelect: (tab: TabId) => void;
  t: ColorPickerTheme;
  labels: Required<ColorPickerLabels>;
};

export const TabBar = memo(function TabBar({ tabs, active, onSelect, t, labels }: TabBarProps) {
  // Up to 3 tabs share the width evenly, more tabs scroll horizontally.
  const useFlexLayout = tabs.length <= 3;

  const tabItems = tabs.map((tab) => {
    const isActive = tab === active;
    return (
      <Pressable
        key={tab}
        testID={`color-picker-tab-${tab}`}
        onPress={() => onSelect(tab)}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        style={{
          ...(useFlexLayout ? { flex: 1 } : null),
          paddingHorizontal: useFlexLayout ? 12 : 16,
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
          borderBottomWidth: 2,
          borderBottomColor: isActive ? t.tabIndicator : "transparent",
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

  return (
    <View
      accessibilityRole="tablist"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: t.border,
        ...(useFlexLayout ? { flexDirection: "row", width: "100%" } : null),
      }}
    >
      {useFlexLayout ? (
        tabItems
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row" }}
        >
          {tabItems}
        </ScrollView>
      )}
    </View>
  );
});
