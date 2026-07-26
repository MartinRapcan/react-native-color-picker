import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ColorPicker } from "../../../src";

export default function SavedScreen() {
  const [color, setColor] = useState("#8E24AA");
  const [savedColors, setSavedColors] = useState<string[]>([]);

  return (
    <>
      <Stack.Screen options={{ title: "Saved Colors" }} />
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.label}>Saved in parent state</Text>
          <Text style={styles.count}>{savedColors.length} color{savedColors.length === 1 ? "" : "s"}</Text>
        </View>

        {savedColors.length > 0 && (
          <View style={styles.savedRow}>
            {savedColors.map((c) => (
              <View key={c} style={[styles.chip, { backgroundColor: c }]} />
            ))}
          </View>
        )}

        <ColorPicker
          value={color}
          onChange={setColor}
          inline
          savedColors={savedColors}
          onSaveColor={(hex) =>
            setSavedColors((prev) => (prev.includes(hex) ? prev : [hex, ...prev]))
          }
          onRemoveSavedColor={(hex) =>
            setSavedColors((prev) => prev.filter((c) => c !== hex))
          }
          onClearSaved={() => setSavedColors([])}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  info: { alignItems: "center", gap: 2 },
  label: { fontSize: 13, color: "#888" },
  count: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  savedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  chip: { width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderColor: "#00000022" },
});
