import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ColorPicker } from "../../../src";

export default function InlineScreen() {
  const [color, setColor] = useState("#43A047");

  return (
    <>
      <Stack.Screen options={{ title: "Inline Picker" }} />
      <View style={styles.container}>
        <View style={styles.previewRow}>
          <View style={[styles.preview, { backgroundColor: color }]} />
          <Text style={styles.value}>{color.toUpperCase()}</Text>
        </View>
        <ColorPicker value={color} onChange={setColor} inline />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  preview: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: "#00000022" },
  value: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
});
