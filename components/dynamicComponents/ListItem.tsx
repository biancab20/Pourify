import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { useRef, useState } from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { DeliveryStatus } from "@/types/deliveries";

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

  // Calculate units: total volume divided by product volume
  const calculateUnits = () => {
    // cases is total volume, cans is product volume
    if (delivery.cans === 0) return 0;
    return delivery.cases / delivery.cans;
  };

  // Format product volume to show 3 decimal places with L
  const formatProductVolume = () => {
    // Just format to 3 decimal places and add L
    return delivery.cans.toFixed(3) + "L";
  };

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
      ></TouchableOpacity>
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

  const units = calculateUnits();
  const formattedVolume = formatProductVolume();

  const Content = (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleItemPress}
      onLongPress={() => onLongPress?.(delivery)}
      delayLongPress={500}
      disabled={readOnly}
    >
      <View
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
      >
        {/* Checkbox for select mode */}
        {isSelectMode && (
          <View
            style={[
              styles.checkbox,
              isSelected && {
                backgroundColor: palette.pink,
                borderColor: palette.pink,
              },
            ]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={16} color={palette.white} />
            )}
          </View>
        )}

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.cardText }]}>
            {delivery.name} · {formattedVolume}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: colors.background }]}>
          <Text style={[styles.badgeValue, { color: colors.text }]}>
            {units.toFixed(0)}
          </Text>
          <Text style={[styles.badgeLabel, { color: colors.icon }]}>units</Text>
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
        onSwipeableOpen={(side) => side === "left" && handleSwipeComplete()}
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
                <Text style={[styles.dropdownText, { color: colors.text }]}>
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
    padding: 12,
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 70,
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
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
