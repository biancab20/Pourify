import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { useRef, useState } from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
// If you have a shared types file, add this:
export type DeliveryStatus = 'pending' | 'received' | 'damaged' | 'missing' | 'substituted';

export type DeliveryItem = {
  id: string;
  name: string;
  cases: number;
  cans: number;
  status?: DeliveryStatus;
  notes?: string;
  substitutedWith?: string; // For substituted items
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
};

export default function ListItem({ 
  delivery, 
  onSwipeComplete, 
  onRemove, 
  onPress,
  isSelectMode = false,
  isSelected = false,
  onLongPress,
  onSelectPress
}: Props) {
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

  const handleItemPress = () => {
    if (isSelectMode && onSelectPress) {
      onSelectPress(delivery);
    } else if (onPress) {
      onPress(delivery);
    }
  };

  const handleItemLongPress = () => {
    if (onLongPress) {
      onLongPress(delivery);
    }
  };

  const renderLeftActions = () => {
    if (isSelectMode) return null;
    
    return (
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
  };

  const renderRightActions = () => {
    if (isSelectMode) return null;
    
    return (
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
  };

  if (!isVisible) return null;

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        overshootLeft={false}
        overshootRight={false}
        leftThreshold={100}
        rightThreshold={30}
        friction={3}
        onSwipeableOpen={(side) => {
          if (side === "left") {
            handleSwipeComplete();
          }
        }}
        enabled={!isSelectMode} // Disable swipe in select mode
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleItemPress}
          onLongPress={handleItemLongPress}
          delayLongPress={500}
          disabled={isSelectMode && !onSelectPress}
        >
          <View style={[
            styles.container, 
            { backgroundColor: colors.cardBackground },
            isSelectMode && isSelected && styles.selectedContainer
          ]}>
            {/* Main content wrapper */}
            <View style={[
              styles.contentWrapper,
              isSelectMode && styles.contentWrapperWithCheckbox
            ]}>
              {/* Checkbox for select mode */}
              {isSelectMode && (
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={palette.white} />
                  )}
                </View>
              )}

              <Text style={[
                styles.title, 
                { color: colors.cardText },
                isSelectMode && isSelected && styles.selectedText
              ]}>
                {delivery.name}
              </Text>
            </View>

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
        </TouchableOpacity>
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
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contentWrapperWithCheckbox: {
    // This ensures content shifts only enough for the checkbox
    marginLeft: 0, // No extra margin
  },
  selectedContainer: {
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  selectedText: {
  },
  badges: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 12, // Keep consistent spacing from title
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF77E0',
    borderColor: '#FF77E0',
  },
});