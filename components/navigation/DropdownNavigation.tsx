import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

type DropdownItem = {
  key: string;
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

type DropdownNavigationProps = {
  title: string;
  onClose: () => void;
  items: DropdownItem[];

  /** Optional tweaks */
  paddingHorizontal?: number; // should match screen container padding
  headerBottomGap?: number; // gap between header and dropdown
};

const ITEM_HEIGHT = 44;
const MENU_PADDING = 8;

export default function DropdownNavigation({
  title,
  onClose,
  items,
  paddingHorizontal = 16,
  headerBottomGap = 0,
}: DropdownNavigationProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const titleColor = theme.isDark ? theme.palette.yellow : theme.palette.pink;

  const [showDropdown, setShowDropdown] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

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
  }, [showDropdown, opacity, scale]);

  const openDropdown = () => setShowDropdown(true);
  const closeDropdown = () => setShowDropdown(false);

  const dropdownLeft = paddingHorizontal;
  const dropdownWidth = Math.max(0, screenWidth - paddingHorizontal * 2);
  const dropdownTop = insets.top + headerHeight + headerBottomGap;

  return (
    <>
      {/* Header row */}
      <View
        style={styles.headerRow}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        {/* Left spacer to keep title centered */}
        <View style={styles.headerSide} />

        {/* Center title trigger */}
        <Pressable onPress={openDropdown} style={styles.titleButton}>
          <Text style={[styles.titleText, { color: titleColor }]}>
            {title}
          </Text>
          <Ionicons
            name={showDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color={titleColor}
            style={{ marginLeft: 8 }}
          />
        </Pressable>

        {/* Right close button */}
        <Pressable
          onPress={onClose}
          style={[styles.headerSide, styles.closeButton]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Dropdown modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <View
          style={{
            position: "absolute",
            left: dropdownLeft,
            top: dropdownTop,
            width: dropdownWidth,
          }}
        >
          <Animated.View
            style={[
              styles.menuWrapper,
              {
                opacity,
                transform: [{ scale }],
              },
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
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.itemRow}
                    onPress={() => {
                      closeDropdown();
                      item.onPress();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={item.accessibilityLabel ?? item.label}
                  >
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingTop: 12,
  },
  headerSide: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    padding: 8,
  },
  titleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
  },

  // Dropdown glass styles
  menuWrapper: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  blurCard: {
    borderRadius: 18,
    overflow: "hidden",
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 18,
    opacity: 0.7,
  },
  menuContent: {
    padding: MENU_PADDING,
  },
  itemRow: {
    height: ITEM_HEIGHT,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
