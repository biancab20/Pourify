import { Bar } from "@/types/DummyData";
import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";

interface StockDropdownNavigationProps {
  bars: Bar[];
  selectedBar: { id: number | null; name: string };
  onBarSelect: (bar: { id: number | null; name: string }) => void;
}

export default function StockDropdownNavigation({
  bars = [],
  selectedBar,
  onBarSelect,
}: StockDropdownNavigationProps) {
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBarSelect = (bar: { id: number | null; name: string }) => {
    onBarSelect(bar);
    setShowDropdown(false);
  };

  const dropdownItems = [
    { id: null, name: "General Stock" },
    ...bars.map(bar => ({ id: bar.barId, name: bar.name }))
  ];

  return (
    <View style={styles.container}>
      {/* Main Button */}
      <TouchableOpacity
        style={[styles.dropdownButton, { backgroundColor: palette.darkBlue }]}
        onPress={() => setShowDropdown(true)}
      >
        <Text style={styles.buttonText} numberOfLines={1}>
          {selectedBar.name}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowDropdown(false)}
        >
          <View style={[styles.dropdownMenu, { backgroundColor: colors.background }]}>
            {dropdownItems.map((item) => (
              <TouchableOpacity
                key={item.id === null ? "general" : `bar-${item.id}`}
                style={[
                  styles.dropdownItem,
                  selectedBar.id === item.id && styles.selectedItem,
                ]}
                onPress={() => handleBarSelect(item)}
              >
                <Text 
                  style={[
                    styles.dropdownItemText, 
                    { color: colors.text },
                    selectedBar.id === item.id && styles.selectedItemText,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  arrow: {
    color: "white",
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    width: "80%",
    borderRadius: 12,
    padding: 8,
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedItemText: {
    fontWeight: "600",
  },
});