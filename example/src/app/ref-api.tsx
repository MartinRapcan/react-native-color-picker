import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ColorPicker, type ColorPickerRef } from "../../../src";

const PRESETS = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#007AFF", "#5856D6", "#AF52DE"];

export default function RefApiScreen() {
  const pickerRef = useRef<ColorPickerRef>(null);
  const [color, setColor] = useState("#007AFF");
  const [savedColors, setSavedColors] = useState<string[]>(["#FF3B30", "#34C759", "#007AFF"]);
  const [readValue, setReadValue] = useState<string | null>(null);

  return (
    <>
      <Stack.Screen options={{ title: "Ref API" }} />
      <View style={styles.container}>
        <View style={styles.pickerRow}>
          <ColorPicker
            ref={pickerRef}
            value={color}
            onChange={setColor}
            savedColors={savedColors}
            onSaveColor={(hex) =>
              setSavedColors((prev) => (prev.includes(hex) ? prev : [hex, ...prev]))
            }
            onRemoveSavedColor={(hex) =>
              setSavedColors((prev) => prev.filter((c) => c !== hex))
            }
            onClearSaved={() => setSavedColors([])}
          />
          <View style={styles.info}>
            <Text style={styles.label}>Current</Text>
            <Text style={styles.value}>{color.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>setColor(hex)</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map((hex) => (
              <TouchableOpacity
                key={hex}
                onPress={() => pickerRef.current?.setColor(hex)}
                style={[styles.preset, { backgroundColor: hex }]}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modal</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.btn} onPress={() => pickerRef.current?.open()}>
              <Text style={styles.btnText}>open()</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => pickerRef.current?.close()}>
              <Text style={styles.btnText}>close()</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Read</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setReadValue(pickerRef.current?.getColor() ?? null)}
            >
              <Text style={styles.btnText}>getColor()</Text>
            </TouchableOpacity>
            {readValue && <Text style={styles.readValue}>→ {readValue.toUpperCase()}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Saved ({savedColors.length})</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={() => pickerRef.current?.clearSaved()}
            >
              <Text style={[styles.btnText, styles.btnDangerText]}>clearSaved()</Text>
            </TouchableOpacity>
          </View>
          {savedColors.length === 0 ? (
            <Text style={styles.emptyHint}>No saved colors — tap Save in the picker.</Text>
          ) : (
            <View style={styles.savedRow}>
              {savedColors.map((hex) => (
                <TouchableOpacity
                  key={hex}
                  onPress={() => pickerRef.current?.removeSavedColor(hex)}
                  style={[styles.savedChip, { backgroundColor: hex }]}
                >
                  <Text style={styles.savedChipX}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text style={styles.hint}>Tap a saved swatch to call removeSavedColor(hex).</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 20 },
  pickerRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  info: { gap: 4 },
  label: { fontSize: 13, color: "#888" },
  value: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  section: { gap: 10 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  presetsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  preset: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: "#00000022" },
  buttonsRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#E8E8E8" },
  btnText: { fontSize: 14, fontWeight: "600", color: "#333" },
  btnDanger: { backgroundColor: "#FFEBEE" },
  btnDangerText: { color: "#C62828" },
  readValue: { fontSize: 14, color: "#1A1A1A" },
  savedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  savedChip: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00000022",
    justifyContent: "center",
    alignItems: "center",
  },
  savedChipX: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  emptyHint: { fontSize: 13, color: "#999", fontStyle: "italic" },
  hint: { fontSize: 12, color: "#888" },
});
