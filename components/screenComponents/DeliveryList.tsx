import React from "react";
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import InputBox from "@/components/dynamicComponents/SearchBar";
import ListItem from "@/components/dynamicComponents/ListItem";
import { useAppTheme } from "@/stores/app-theme-context";
import { Ionicons } from "@expo/vector-icons";

export type DeliveryItem = {
  id: string;
  name: string;
  cases: number;
  cans: number;
};

export type DeliveryAction = "received" | "substituted" | "quantity_mismatch";

type DeliveryListProps = {
  title?: string;
  deliveries: DeliveryItem[];
  loading?: boolean;
  onSearch?: (query: string) => void;
  onSwipeComplete?: (id: string) => void;
  onItemPress?: (item: DeliveryItem) => void;
  emptyState?: {
    title: string;
    message?: string;
  };
  searchPlaceholder?: string;
  showSearch?: boolean;
  showResultsCount?: boolean;
  removedIds?: string[];
  onAction?: (item: DeliveryItem, action: DeliveryAction) => void;
};

const DeliveryList = ({
  title = "Check delivery list",
  deliveries = [],
  loading = false,
  onSearch,
  onSwipeComplete,
  onItemPress,
  emptyState,
  searchPlaceholder = "Search delivery item...",
  showSearch = true,
  showResultsCount = true,
  removedIds = [],
  onAction,
}: DeliveryListProps) => {
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localRemovedIds, setLocalRemovedIds] =
    React.useState<string[]>(removedIds);
  const [isSelectMode, setIsSelectMode] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(
    new Set()
  );
  const [helpVisible, setHelpVisible] = React.useState(false);
  const router = useRouter();
  const shortHint =
    "Swipe to mark delivered · Long-press to select multiple · Tap to report what you received";

  const helpText =
    "Swipe the item to the right if it was physically delivered to you.\n\n" +
    "Long-press a product to select multiple items at the same time. Selected products will be marked as delivered and removed from the list.\n\n" +
    "You can view everything later in the delivery summary.\n\n" +
    "Tap a product if something is not as expected.";

  // Format item name to title case
  const formatItemName = (name: string): string => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format deliveries with title case names
  const formattedDeliveries = React.useMemo(() => {
    return deliveries.map((item) => ({
      ...item,
      name: formatItemName(item.name),
    }));
  }, [deliveries]);

  // Filter out removed items
  const activeDeliveries = React.useMemo(() => {
    return formattedDeliveries.filter(
      (item) => !localRemovedIds.includes(item.id)
    );
  }, [formattedDeliveries, localRemovedIds]);

  // Filter by search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return activeDeliveries;
    const query = searchQuery.toLowerCase();
    return activeDeliveries.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [activeDeliveries, searchQuery]);

  // Check if all items have been swiped
  const allItemsSwiped = React.useMemo(() => {
    return (
      deliveries.length > 0 && localRemovedIds.length === deliveries.length
    );
  }, [deliveries.length, localRemovedIds.length]);
  React.useEffect(() => {
    setLocalRemovedIds(removedIds);
  }, [removedIds]);
  const handleSearch = (value: string | number) => {
    const query = value.toString();
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSwipeComplete = (id: string) => {
    setLocalRemovedIds((prev) => [...prev, id]);
    onSwipeComplete?.(id);
    if (selectedItems.has(id)) {
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleItemPress = (item: DeliveryItem) => {
    Alert.alert(
      "What happened with this item?",
      `${item.name}\n\nSelect what you actually received.`,
      [
        {
          text: "Received (as expected)",
          onPress: () => {
            onAction?.(item, "received");

            // Optionally reuse existing swipe behavior (removes from list)
            onSwipeComplete?.(item.id);
            setLocalRemovedIds((prev) => [...prev, item.id]);
          },
        },
        {
          text: "I received another product",
          onPress: () => {
            onAction?.(item, "substituted");
            Alert.alert(
              "Substitution noted",
              "Later, we’ll let you pick which product you received instead."
            );
          },
        },
        {
          text: "Quantity doesn’t match",
          onPress: () => {
            onAction?.(item, "quantity_mismatch");
            router.push({
              pathname: "/(scan-flow)/quantity-mismatch",
              params: {
                id: item.id,
                name: item.name,
                cases: String(item.cases),
                cans: String(item.cans),
                unitLabel: "Bottles",
              },
            });
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );

    onItemPress?.(item);
  };

  const handleLongPress = (item: DeliveryItem) => {
    // Enable select mode on first long press
    if (!isSelectMode) {
      setIsSelectMode(true);
      setSelectedItems(new Set([item.id]));
    }
  };

  const handleSelectPress = (item: DeliveryItem) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredData.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all filtered items
      const allIds = filteredData.map((item) => item.id);
      setSelectedItems(new Set(allIds));
    }
  };

  const handleCancelSelect = () => {
    setIsSelectMode(false);
    setSelectedItems(new Set());
  };

  const handleCheckMultiple = () => {
    // Mark all selected items as completed
    selectedItems.forEach((id) => {
      handleSwipeComplete(id);
    });
    setIsSelectMode(false);
    setSelectedItems(new Set());
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.text }}>Loading deliveries...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with title or selection controls */}
      <View style={styles.header}>
        {isSelectMode ? (
          <>
            {/* Left button - Select all/Deselect all */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSelectAll}
              accessibilityLabel="Select all"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.headerButtonText,
                  {
                    color:
                      theme.mode === "dark" ? palette.yellow : palette.pink,
                  },
                ]}
              >
                {selectedItems.size === filteredData.length
                  ? "Deselect all"
                  : "Select all"}
              </Text>
            </TouchableOpacity>

            {/* Centered title - Check List */}
            <View style={styles.centerTitle}>
              <Text
                style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}
              >
                Check List
              </Text>
            </View>

            {/* Right button - Cancel */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCancelSelect}
              accessibilityLabel="Cancel selection"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.headerButtonText,
                  {
                    color:
                      theme.mode === "dark" ? palette.yellow : palette.pink,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.titleRow}>
            <Text variant="gradient" gradientName="paloma" style={styles.title}>
              {title}
            </Text>

            <TouchableOpacity
              onPress={() => setHelpVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="How does this work?"
              style={styles.infoButton}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={theme.mode === "dark" ? palette.yellow : palette.pink}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Short hint */}
      {!isSelectMode && (
        <Text style={[styles.hintText, { color: colors.icon }]}>
          {shortHint}
        </Text>
      )}
      {/* Search */}
      {showSearch && !isSelectMode && (
        <InputBox
          placeholder={searchPlaceholder}
          initialValue=""
          onSearch={handleSearch}
        />
      )}

      {/* Results count */}
      {showResultsCount && searchQuery && !isSelectMode && (
        <Text style={[styles.resultsText, { color: colors.text }]}>
          {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
        </Text>
      )}
      {/* Column headers */}
      {filteredData.length > 0 && !isSelectMode && (
        <View style={styles.columnHeader}>
          <Text style={[styles.columnHeaderText, { color: colors.icon }]}>
            Product name · Package volume
          </Text>
          <Text
            style={[
              styles.columnHeaderText,
              styles.columnHeaderRight,
              { color: colors.icon },
            ]}
          >
            Quantity
          </Text>
        </View>
      )}
      {/* Deliveries list */}
      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          {allItemsSwiped ? (
            <>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Delivery marked successfully!
              </Text>
              <Text style={[styles.successMessage, { color: colors.icon }]}>
                Please continue to delivery summary
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                {emptyState?.title ||
                  (deliveries.length === 0
                    ? "No deliveries available"
                    : "No deliveries match your search")}
              </Text>
              {emptyState?.message && (
                <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                  {emptyState.message}
                </Text>
              )}
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              delivery={item}
              onSwipeComplete={handleSwipeComplete}
              onPress={() => handleItemPress(item)}
              onLongPress={() => handleLongPress(item)}
              onSelectPress={() => handleSelectPress(item)}
              isSelectMode={isSelectMode}
              isSelected={selectedItems.has(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Selection mode footer */}
      {isSelectMode && (
        <View style={styles.selectionFooter}>
          <TouchableOpacity
            style={[
              styles.checkMultipleButton,
              { backgroundColor: palette.pink },
            ]}
            onPress={handleCheckMultiple}
            accessibilityLabel="Check multiple items"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark" size={20} color={palette.white} />
            <Text
              style={[
                styles.checkMultipleText,
                { color: palette.white, marginLeft: 8 },
              ]}
            >
              Check multiple
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.helpOverlay}
          onPress={() => setHelpVisible(false)}
        >
          <View
            style={[
              styles.helpCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.helpHeader}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>
                How it works
              </Text>
              <TouchableOpacity
                onPress={() => setHelpVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close help"
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.helpBody, { color: colors.text }]}>
              {helpText}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    height: 40,
  },
  centerTitle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  headerButton: {
    width: 100, // Fixed width for alignment
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  resultsText: {
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  checkMultipleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  checkMultipleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  columnHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.7,
  },
  columnHeaderRight: {
    textAlign: "right",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  infoButton: {
    paddingLeft: 12,
    paddingVertical: 6,
  },
  hintText: {
    marginTop: -10,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
  },
  helpOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  helpCard: {
    borderRadius: 18,
    padding: 16,
  },
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  helpBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DeliveryList;
