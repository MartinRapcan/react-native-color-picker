import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ColorPicker } from "../../../src";

export default function AlphaScreen() {
  const [color, setColor] = useState("#FF3B30CC");

  return (
    <>
      <Stack.Screen options={{ title: "Alpha Channel" }} />
      <View style={styles.container}>
        <View style={styles.previewRow}>
          <View style={styles.checker}>
            <View style={[styles.preview, { backgroundColor: color }]} />
          </View>
          <View>
            <Text style={styles.label}>8-digit hex</Text>
            <Text style={styles.value}>{color.toUpperCase()}</Text>
          </View>
        </View>
        <ColorPicker value={color} onChange={setColor} showAlpha inline />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checker: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E5E5E5",
    borderWidth: 1,
    borderColor: "#00000022",
  },
  preview: { width: "100%", height: "100%" },
  label: { fontSize: 13, color: "#888" },
  value: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
});
