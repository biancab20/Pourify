import { Bar } from "@/types/DummyData";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  PanResponder,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface StockDropdownNavigationProps {
  bars: Bar[];
  selectedBar: { id: number | null; name: string };
  onBarSelect: (bar: { id: number | null; name: string }) => void;
}

type Anchor = { x: number; y: number; width: number; height: number };

const ITEM_HEIGHT = 48; // smaller than before
const MENU_PADDING = 6; // tighter than before
const GAP_BELOW_BUTTON = 6;

export default function StockDropdownNavigation({
  bars = [],
  selectedBar,
  onBarSelect,
}: StockDropdownNavigationProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const dropdownItems = useMemo(
    () => [
      { id: null, name: "General Stock" },
      ...bars.map((bar) => ({ id: bar.barId, name: bar.name })),
    ],
    [bars]
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const buttonRef = useRef<View>(null);

  // ---- open animation (pop) ----
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

  const openDropdown = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setShowDropdown(true);
    });
  };

  const closeDropdown = () => {
    setShowDropdown(false);
    setActiveIndex(null);
  };

  const handleBarSelect = (bar: { id: number | null; name: string }) => {
    onBarSelect(bar);
    closeDropdown();
  };

  // ---- press & slide highlight ONLY (no select on release) ----
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const y = evt.nativeEvent.locationY;
        const idx = Math.floor((y - MENU_PADDING) / ITEM_HEIGHT);
        if (idx >= 0 && idx < dropdownItems.length) setActiveIndex(idx);
        else setActiveIndex(null);
      },

      onPanResponderMove: (evt) => {
        const y = evt.nativeEvent.locationY;
        const idx = Math.floor((y - MENU_PADDING) / ITEM_HEIGHT);
        if (idx >= 0 && idx < dropdownItems.length) setActiveIndex(idx);
        else setActiveIndex(null);
      },

      // ✅ do NOT close or select on release
      onPanResponderRelease: () => {
        setActiveIndex(null);
      },

      onPanResponderTerminate: () => setActiveIndex(null),
    })
  ).current;

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
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <View style={styles.overlay}>
          {/* Outside area closes */}
          <TouchableWithoutFeedback onPress={closeDropdown}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          {/* Menu (does NOT close when pressed) */}
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

                <View style={styles.menuContent} {...panResponder.panHandlers}>
                  {dropdownItems.map((item, index) => {
                    const isSelected = selectedBar.id === item.id;
                    const isActive = activeIndex === index;

                    return (
                      <TouchableOpacity
                        key={item.id === null ? "general" : `bar-${item.id}`}
                        style={[
                          styles.itemRow,
                          isActive && styles.itemActive,
                          isSelected && styles.itemSelectedRow,
                        ]}
                        onPress={() => handleBarSelect(item)} // stays open now
                      >
                        <Text
                          style={[
                            styles.itemText,
                            { color: colors.text },
                            isSelected && styles.itemSelectedText,
                          ]}
                          numberOfLines={1}
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
        </View>
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
    backgroundColor: "transparent",
  },

  menuWrapper: {
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
    justifyContent: "space-between",
  },

  // highlight while dragging
  itemActive: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  // optional subtle selected background (independent of active)
  itemSelectedRow: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  itemText: {
    fontSize: 16,
    fontWeight: "500",
    flexShrink: 1,
    paddingRight: 10,
  },

  itemSelectedText: {
    fontWeight: "700",
  },
});
