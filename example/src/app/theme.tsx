import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ColorPicker, type ColorPickerThemeProp } from "../../../src";

type ThemeOption = "light" | "dark" | "custom";

// Partial override merged on top of a built-in base theme.
const CUSTOM_THEME: ColorPickerThemeProp = {
  base: "dark",
  background: "#0F2A2E",
  surface: "rgba(94,234,212,0.08)",
  border: "rgba(94,234,212,0.25)",
  tabActive: "#5EEAD4",
  tabIndicator: "#5EEAD4",
  tabActiveText: "#0F2A2E",
  thumbBorder: "#5EEAD4",
};

export default function ThemeScreen() {
  const [color, setColor] = useState("#FB8C00");
  const [theme, setTheme] = useState<ThemeOption>("dark");

  return (
    <>
      <Stack.Screen options={{ title: "Theme" }} />
      <View style={styles.container}>
        <View style={styles.toggleRow}>
          {(["light", "dark", "custom"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTheme(t)}
              style={[styles.toggle, theme === t && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, theme === t && styles.toggleTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ColorPicker
          value={color}
          onChange={setColor}
          inline
          theme={theme === "custom" ? CUSTOM_THEME : theme}
        />
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
