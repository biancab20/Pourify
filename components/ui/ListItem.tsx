import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { useRef, useState } from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";

type DeliveryItem = {
  id: string;
  name: string;
  cases: number;
  cans: number;
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
};

export default function ListItem({ delivery, onSwipeComplete, onRemove }: Props) {
  const { theme } = useAppTheme();
  const { colors, palette } = theme;

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  const buttonRef = useRef<View>(null);
  const swipeableRef = useRef<Swipeable>(null);

  const dropdownOptions: DropdownOption[] = [
    { id: "1", label: "Edit", onPress: () => console.log("Edit", delivery.id) },
    { id: "2", label: "Damaged", onPress: () => console.log("Damaged", delivery.id) },
    { id: "3", label: "Missing", onPress: () => console.log("Missing", delivery.id) },
    { id: "4", label: "Substituted", onPress: () => console.log("Substituted", delivery.id) },
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

  const renderLeftActions = () => (
    <TouchableOpacity
      style={[styles.leftAction, { backgroundColor: palette.green }]}
      onPress={handleSwipeComplete}
      accessibilityLabel="Complete delivery"
      accessibilityRole="button"
      accessibilityHint="Marks delivery as complete and removes from list"
    >
      <Ionicons name="checkmark" size={28} color={palette.black} style={{ marginLeft: 10 }} />
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <View style={styles.rightActionsWrapper}>
      <View style={styles.rightActionsOverlap}>
        <TouchableOpacity
          ref={buttonRef}
          style={[styles.actionButton, styles.actionButtonBehind, { backgroundColor: palette.pink }]}
          onPress={handleMenuPress}
          accessibilityLabel="More options"
          accessibilityRole="button"
          accessibilityHint="Opens menu with more actions"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={palette.black} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isVisible) return null;

  return (
    <>
      <Swipeable
  ref={swipeableRef}
  renderLeftActions={renderLeftActions}  // just the green background, no press needed
  renderRightActions={renderRightActions}
  overshootLeft={false}
  overshootRight={false}
  leftThreshold={100}
  rightThreshold={30}
  friction={3}
  onSwipeableOpen={(side) => {
    if (side === "left") {
      handleSwipeComplete(); // automatically remove item
    }
    // right swipe does nothing
  }}
>
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.title, { color: colors.cardText }]}>{delivery.name}</Text>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.background }]}>
              <Text style={[styles.badgeValue, { color: colors.text }]}>{delivery.cases}</Text>
              <Text style={[styles.badgeLabel, { color: colors.icon }]}>cases</Text>
            </View>

            <View style={[styles.badge, { backgroundColor: colors.background }]}>
              <Text style={[styles.badgeValue, { color: colors.text }]}>{delivery.cans}</Text>
              <Text style={[styles.badgeLabel, { color: colors.icon }]}>cans</Text>
            </View>
          </View>
        </View>
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
                shadowColor: colors.text,
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
                  index !== dropdownOptions.length - 1 && styles.dropdownItemBorder,
                  { borderBottomColor: "#fff" },
                ]}
                onPress={() => {
                  option.onPress();
                  setDropdownVisible(false);
                }}
                accessibilityLabel={option.label}
                accessibilityRole="button"
              >
                {option.icon && (
                  <Ionicons name={option.icon} size={18} color={colors.icon} style={styles.dropdownIcon} />
                )}
                <Text style={[styles.dropdownText, { color: colors.text }]}>{option.label}</Text>
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
    justifyContent: "space-between",
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    maxWidth: "55%",
  },
  badges: {
    flexDirection: "row",
    gap: 10,
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  dropdown: {
    position: "absolute",
    width: 160,
    borderRadius: 12,
    paddingVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
