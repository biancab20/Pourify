import { Bar } from "@/types/DummyData";
import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Ionicons } from "@expo/vector-icons";

interface StockDropdownNavigationProps {
  bars: Bar[];
  selectedBar: { id: number | null; name: string };
  onBarSelect: (bar: { id: number | null; name: string }) => void;
}

type Anchor = { x: number; y: number; width: number; height: number };

export default function StockDropdownNavigation({
  bars = [],
  selectedBar,
  onBarSelect,
}: StockDropdownNavigationProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const [showDropdown, setShowDropdown] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const buttonRef = useRef<View>(null);

  const dropdownItems = useMemo(
    () => [
      { id: null, name: "General Stock" },
      ...bars.map((bar) => ({ id: bar.barId, name: bar.name })),
    ],
    [bars]
  );

  const openDropdown = () => {
    // measure button and anchor menu right under it
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setShowDropdown(true);
    });
  };

  const closeDropdown = () => setShowDropdown(false);

  const handleBarSelect = (bar: { id: number | null; name: string }) => {
    onBarSelect(bar);
    closeDropdown();
  };

  return (
    <View style={styles.container}>
      {/* Main Button */}
      <View ref={buttonRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.dropdownButton, { backgroundColor: colors.cardBackground }]}
          onPress={showDropdown ? closeDropdown : openDropdown}
          accessibilityRole="button"
          accessibilityLabel="Select bar"
          accessibilityState={{ expanded: showDropdown }}
        >
          <Text
            style={[styles.buttonText, { color: colors.text }]}
            numberOfLines={1}
          >
            {selectedBar.name}
          </Text>

          <Ionicons
            name={showDropdown ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.text}
            style={styles.chevron}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        {/* Full-screen overlay to close on outside press */}
        <Pressable style={styles.overlay} onPress={closeDropdown}>
          {/* Stop propagation so tapping inside doesn’t close */}
          <Pressable
            onPress={() => {}}
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: colors.background,
                left: anchor?.x ?? 0,
                top: (anchor?.y ?? 0) + (anchor?.height ?? 0) + 6, // 6px gap
                width: anchor?.width ?? undefined, // match button width
              },
            ]}
          >
            {dropdownItems.map((item) => {
              const isSelected = selectedBar.id === item.id;

              return (
                <TouchableOpacity
                  key={item.id === null ? "general" : `bar-${item.id}`}
                  style={[styles.dropdownItem, isSelected && styles.selectedItem]}
                  onPress={() => handleBarSelect(item)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: colors.text },
                      isSelected && styles.selectedItemText,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    maxWidth: 320,
    maxHeight: 48,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "400",
    flexShrink: 1,
  },

  chevron: {
    marginLeft: 8,
  },

  overlay: {
    flex: 1,
    backgroundColor: "transparent", // no dim, feels like a real dropdown
  },

  dropdownMenu: {
    position: "absolute",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 260,
    // optional shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  selectedItem: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },

  dropdownItemText: {
    fontSize: 16,
    fontWeight: "500",
  },

  selectedItemText: {
    fontWeight: "700",
  },
});
