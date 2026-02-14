import { ColorPicker } from "@darthrapid/react-native-color-picker";
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function App() {
  const [color, setColor] = useState("#ff0000");

  return (
    <View style={styles.container}>
      <ColorPicker
        value={color}
        onChange={setColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
});
