import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { useRef, useState } from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";

export type DeliveryStatus =
  | "pending"
  | "received"
  | "damaged"
  | "missing"
  | "substituted";

export type DeliveryItem = {
  id: string;
  name: string;
  cases: number;
  cans: number;
  status?: DeliveryStatus;
  notes?: string;
  substitutedWith?: string;
};

type DropdownOption = {
  id: string;
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Props = {
  delivery: DeliveryItem;
  onSwipeComplete?: (id: string) => void;
  onRemove?: (id: string) => void;
  onPress?: (item: DeliveryItem) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onLongPress?: (item: DeliveryItem) => void;
  onSelectPress?: (item: DeliveryItem) => void;
  readOnly?: boolean;
};

export default function ListItem({
  delivery,
  onSwipeComplete,
  onRemove,
  onPress,
  isSelectMode = false,
  isSelected = false,
  onLongPress,
  onSelectPress,
  readOnly = false,
}: Props) {
  const { theme } = useAppTheme();
  const { colors, palette } = theme;

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  const buttonRef = useRef<View>(null);
  const swipeableRef = useRef<Swipeable>(null);

  const dropdownOptions: DropdownOption[] = [
    { id: "1", label: "Edit", onPress: () => {} },
    { id: "2", label: "Damaged", onPress: () => {} },
    { id: "3", label: "Missing", onPress: () => {} },
    { id: "4", label: "Substituted", onPress: () => {} },
  ];

  const handleMenuPress = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          x: x - 140,
          y: y + height,
        });
        setDropdownVisible(true);
      });
    }
  };

  const handleSwipeComplete = () => {
    swipeableRef.current?.close();
    setIsVisible(false);

    setTimeout(() => {
      if (onSwipeComplete) onSwipeComplete(delivery.id);
      else if (onRemove) onRemove(delivery.id);
    }, 300);
  };

  const handleItemPress = () => {
    if (isSelectMode && onSelectPress) {
      onSelectPress(delivery);
    } else {
      onPress?.(delivery);
    }
  };

  const renderLeftActions = () => {
    if (readOnly || isSelectMode) return null;

    return (
      <TouchableOpacity
        style={[styles.leftAction, { backgroundColor: palette.green }]}
        onPress={handleSwipeComplete}
      >
      </TouchableOpacity>
    );
  };

  const renderRightActions = () => {
    if (readOnly || isSelectMode) return null;

    return (
      <View style={styles.rightActionsWrapper}>
        <View style={styles.rightActionsOverlap}>
          <TouchableOpacity
            ref={buttonRef}
            style={[
              styles.actionButton,
              styles.actionButtonBehind,
              { backgroundColor: palette.pink },
            ]}
            onPress={handleMenuPress}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={palette.black}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!isVisible) return null;

  const Content = (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleItemPress}
      onLongPress={() => onLongPress?.(delivery)}
      delayLongPress={500}
      disabled={readOnly}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        {/* ✅ CHECKBOX RESTORED */}
        {isSelectMode && (
          <View
            style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
            ]}
          >
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={16}
                color={palette.white}
              />
            )}
          </View>
        )}

        <Text style={[styles.title, { color: colors.cardText }]}>
          {delivery.name}
        </Text>

        <View style={styles.badges}>
          <View
            style={[styles.badge, { backgroundColor: colors.background }]}
          >
            <Text
              style={[styles.badgeValue, { color: colors.text }]}
            >
              {delivery.cases}
            </Text>
            <Text
              style={[styles.badgeLabel, { color: colors.icon }]}
            >
              cases
            </Text>
          </View>

          <View
            style={[styles.badge, { backgroundColor: colors.background }]}
          >
            <Text
              style={[styles.badgeValue, { color: colors.text }]}
            >
              {delivery.cans}
            </Text>
            <Text
              style={[styles.badgeLabel, { color: colors.icon }]}
            >
              cans
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (readOnly) return Content;

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        overshootLeft={false}
        overshootRight={false}
        rightThreshold={30}
        leftThreshold={100}
        friction={3}
        enabled={!isSelectMode}
        onSwipeableOpen={(side) =>
          side === "left" && handleSwipeComplete()
        }
      >
        {Content}
      </Swipeable>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.cardBackground,
                left: dropdownPosition.x,
                top: dropdownPosition.y,
              },
            ]}
          >
            {dropdownOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dropdownItem,
                  index !== dropdownOptions.length - 1 &&
                    styles.dropdownItemBorder,
                ]}
                onPress={() => {
                  option.onPress();
                  setDropdownVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    { color: colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  badges: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 12,
  },
  badge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#FF77E0",
    borderColor: "#FF77E0",
  },
  leftAction: {
    flex: 1,
    marginVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  rightActionsWrapper: {
    width: 40,
    marginVertical: 8,
  },
  rightActionsOverlap: {
    flexDirection: "row",
    height: "100%",
    position: "relative",
  },
  actionButton: {
    width: 64,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 16,
    borderRadius: 20,
  },
  actionButtonBehind: {
    position: "absolute",
    right: 0,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dropdown: {
    position: "absolute",
    width: 160,
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
