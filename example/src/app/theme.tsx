import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ColorPicker } from "../../../src";

export default function ThemeScreen() {
  const [color, setColor] = useState("#FB8C00");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  return (
    <>
      <Stack.Screen options={{ title: "Theme" }} />
      <View style={styles.container}>
        <View style={styles.toggleRow}>
          {(["light", "dark"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTheme(t)}
              style={[styles.toggle, theme === t && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, theme === t && styles.toggleTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ColorPicker value={color} onChange={setColor} inline theme={theme} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  toggleRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  toggle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E8E8E8",
  },
  toggleActive: { backgroundColor: "#1A1A1A" },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#333" },
  toggleTextActive: { color: "#FFF" },
});
