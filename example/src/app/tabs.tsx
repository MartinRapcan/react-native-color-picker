import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ColorPicker, tailwindPalette, type TabId } from "../../../src";

// Picker is the main way to choose a color, so it's always included.
// The package also enforces this automatically — if you pass ["values"], it becomes ["picker", "values"].
const OPTIONS: { key: string; tabs: TabId[]; label: string }[] = [
  { key: "all", tabs: ["picker", "values", "palettes"], label: "All" },
  { key: "picker+values", tabs: ["picker", "values"], label: "Picker + Values" },
  { key: "picker+palettes", tabs: ["picker", "palettes"], label: "Picker + Palettes" },
  { key: "picker", tabs: ["picker"], label: "Picker only" },
];

export default function TabsScreen() {
  const [color, setColor] = useState("#FF9500");
  const [selected, setSelected] = useState(OPTIONS[0]!);

  return (
    <>
      <Stack.Screen options={{ title: "Tabs" }} />
      <View style={styles.container}>
        <View style={styles.optionsRow}>
          {OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.key}
              onPress={() => setSelected(o)}
              style={[styles.chip, selected.key === o.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, selected.key === o.key && styles.chipTextActive]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ColorPicker
          key={selected.key}
          value={color}
          onChange={setColor}
          inline
          tabs={selected.tabs}
          palettes={[tailwindPalette]}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#E8E8E8",
  },
  chipActive: { backgroundColor: "#1A1A1A" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#333" },
  chipTextActive: { color: "#FFF" },
});
