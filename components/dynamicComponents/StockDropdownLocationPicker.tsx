import { Bar } from "@/types/locations";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface StockDropdownNavigationProps {
  bars: Bar[];
  selectedBar: { id: string | null; name: string };
  onBarSelect: (bar: { id: string | null; name: string }) => void;
}

type Anchor = { x: number; y: number; width: number; height: number };

const ITEM_HEIGHT = 40;
const MENU_PADDING = 6;
const GAP_BELOW_BUTTON = 4;

export default function StockDropdownLocationPicker({
  bars = [],
  selectedBar,
  onBarSelect,
}: StockDropdownNavigationProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const dropdownItems = useMemo(
    () => [
      { id: null, name: "General Stock" },
      ...bars.map((bar) => ({ id: bar.barId, name: bar.name })), // bar.barId is string
    ],
    [bars],
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const buttonRef = useRef<View>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  // Animate dropdown
  useEffect(() => {
    if (!showDropdown) return;

    opacity.setValue(0);
    scale.setValue(0.96);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showDropdown, opacity, scale]); // Added opacity and scale to dependencies

  const openDropdown = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setShowDropdown(true);
    });
  };

  const closeDropdown = () => setShowDropdown(false);

  const handleSelect = (bar: { id: string | null; name: string }) => {
    onBarSelect(bar);
    closeDropdown();
  };

  const menuLeft = anchor?.x ?? 0;
  const menuTop = (anchor?.y ?? 0) + (anchor?.height ?? 0) + GAP_BELOW_BUTTON;
  const menuWidth = anchor?.width ?? undefined;

  return (
    <View style={styles.container}>
      <View ref={buttonRef} collapsable={false}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={showDropdown ? closeDropdown : openDropdown}
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

      <Modal visible={showDropdown} transparent animationType="none">
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <View
          style={{
            position: "absolute",
            left: menuLeft,
            top: menuTop,
            width: menuWidth,
          }}
        >
          <Animated.View
            style={[
              styles.menuWrapper,
              { width: menuWidth, opacity, transform: [{ scale }] },
            ]}
          >
            <BlurView
              intensity={35}
              tint={theme.isDark ? "dark" : "light"}
              style={styles.blurCard}
            >
              <View
                style={[
                  styles.glassBorder,
                  { borderColor: theme.isDark ? "#3A3A3A" : "#D0D0D0" },
                ]}
              />

              <View style={styles.menuContent}>
                {dropdownItems.map((item) => {
                  const isSelected = selectedBar.id === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id === null ? "general" : `bar-${item.id}`}
                      style={[
                        styles.itemRow,
                        isSelected && styles.itemSelectedRow,
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={[
                          styles.itemText,
                          { color: colors.text },
                          isSelected && styles.itemSelectedText,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={colors.text}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "flex-start" },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    maxWidth: 320,
  },
  buttonText: { fontSize: 16, fontWeight: "400", flexShrink: 1 },
  chevron: { marginLeft: 8 },
  menuWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  blurCard: { borderRadius: 18, overflow: "hidden" },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 18,
    opacity: 0.7,
  },
  menuContent: { padding: MENU_PADDING },
  itemRow: {
    height: ITEM_HEIGHT,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemSelectedRow: { backgroundColor: "rgba(255,255,255,0.08)" },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    flexShrink: 1,
    paddingRight: 10,
  },
  itemSelectedText: { fontWeight: "700" },
});
