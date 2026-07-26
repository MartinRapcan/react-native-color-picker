import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEMOS = [
  {
    href: "/modal",
    title: "Modal Swatch",
    description: "Default mode — tap the swatch to open the picker in a modal",
  },
  {
    href: "/inline",
    title: "Inline Picker",
    description: "Picker rendered directly in the layout without a modal",
  },
  {
    href: "/alpha",
    title: "Alpha Channel",
    description: "Alpha slider + 8-digit hex (#RRGGBBAA) output",
  },
  {
    href: "/palettes",
    title: "Palettes",
    description: "Built-in Tailwind palette and a custom brand palette",
  },
  {
    href: "/saved",
    title: "Saved Colors (controlled)",
    description: "Persist saved colors in parent state via callbacks",
  },
  {
    href: "/theme",
    title: "Light / Dark Theme",
    description: "Toggle between the two built-in themes",
  },
  {
    href: "/i18n",
    title: "i18n / Custom Labels",
    description: "Override the default English labels (Slovak example)",
  },
  {
    href: "/ref-api",
    title: "Ref API",
    description: "Open, close, read and set the color programmatically",
  },
  {
    href: "/tabs",
    title: "Tabs Configuration",
    description: "Show only the tabs you want (picker / values / palettes)",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Color Picker</Text>
          <Text style={styles.subtitle}>Examples</Text>
        </View>
        <View style={styles.cardList}>
          {DEMOS.map((demo) => (
            <TouchableOpacity
              key={demo.href}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(demo.href)}
            >
              <Text style={styles.cardTitle}>{demo.title}</Text>
              <Text style={styles.cardDescription}>{demo.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 4,
  },
  cardList: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
