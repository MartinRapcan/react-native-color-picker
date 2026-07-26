import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ColorPicker } from "../../../src";

export default function ModalScreen() {
  const [color, setColor] = useState("#007AFF");

  return (
    <>
      <Stack.Screen options={{ title: "Modal Swatch" }} />
      <View style={styles.container}>
        <Text style={styles.hint}>Tap the swatch to open the picker.</Text>
        <ColorPicker value={color} onChange={setColor} />
        <View style={styles.info}>
          <Text style={styles.label}>Current value</Text>
          <Text style={styles.value}>{color.toUpperCase()}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24, padding: 24 },
  hint: { fontSize: 14, color: "#666" },
  info: { alignItems: "center", gap: 4 },
  label: { fontSize: 13, color: "#888" },
  value: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
});
