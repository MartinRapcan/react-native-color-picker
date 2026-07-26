import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ColorPicker, tailwindPalette } from "../../../src";

const brandPalette = {
  name: "Brand",
  colors: {
    primary: "#007AFF",
    secondary: "#5856D6",
    accent: "#FF2D55",
    success: "#34C759",
    warning: "#FF9500",
    danger: "#FF3B30",
    blue: {
      100: "#DBEAFE",
      300: "#93C5FD",
      500: "#3B82F6",
      700: "#1D4ED8",
      900: "#1E3A8A",
    },
    gray: {
      100: "#F3F4F6",
      300: "#D1D5DB",
      500: "#6B7280",
      700: "#374151",
      900: "#111827",
    },
  },
};

export default function PalettesScreen() {
  const [color, setColor] = useState("#3B82F6");

  return (
    <>
      <Stack.Screen options={{ title: "Palettes" }} />
      <View style={styles.container}>
        <View style={styles.previewRow}>
          <View style={[styles.preview, { backgroundColor: color }]} />
          <Text style={styles.value}>{color.toUpperCase()}</Text>
        </View>
        <ColorPicker
          value={color}
          onChange={setColor}
          inline
          palettes={[brandPalette, tailwindPalette]}
        />
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
