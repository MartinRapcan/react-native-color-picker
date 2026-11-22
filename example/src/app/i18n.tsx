import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ColorPicker, tailwindPalette, type ColorPickerLabels } from "../../../src";

const skLabels = {
  picker: "Výber",
  values: "Hodnoty",
  palettes: "Palety",
  save: "Uložiť",
  saved: "Uložené",
  clearSaved: "Vymazať",
  confirmClear: "Naozaj?",
  noSavedColors: "Žiadne uložené farby",
  // Screen-reader labels (VoiceOver / TalkBack)
  hue: "Odtieň",
  saturation: "Sýtosť",
  brightness: "Jas",
  alpha: "Priehľadnosť",
  hex: "Hex farba",
  red: "Červená",
  green: "Zelená",
  blue: "Modrá",
  openPicker: "Otvoriť výber farby",
  closePicker: "Zavrieť výber farby",
  removeColor: "Odstrániť farbu",
} satisfies ColorPickerLabels;

export default function I18nScreen() {
  const [color, setColor] = useState("#1E88E5");

  return (
    <>
      <Stack.Screen options={{ title: "i18n" }} />
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.label}>Labels overridden (Slovak)</Text>
          <Text style={styles.value}>{color.toUpperCase()}</Text>
        </View>
        <ColorPicker
          value={color}
          onChange={setColor}
          inline
          labels={skLabels}
          palettes={[tailwindPalette]}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  info: { alignItems: "center", gap: 4 },
  label: { fontSize: 13, color: "#888" },
  value: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
});
