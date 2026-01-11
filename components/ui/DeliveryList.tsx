import React from "react";
import { FlatList, StyleSheet, View, TouchableOpacity} from "react-native";
import { Text } from "@/components/shared/Text";
import InputBox from "@/components/ui/InputBox";
import ListItem from "@/components/ui/ListItem";
import { useAppTheme } from "@/stores/app-theme-context";
import { Ionicons } from "@expo/vector-icons";

export type DeliveryItem = {
  id: string;
  name: string;
  cases: number;
  cans: number;
};

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
};

const DeliveryList = ({
  title = "Check delivery list",
  deliveries = [],
  loading = false,
  onSearch,
  onSwipeComplete,
  onItemPress,
  emptyState,
  searchPlaceholder = "Search deliveries...",
  showSearch = true,
  showResultsCount = true,
  removedIds = [],
}: DeliveryListProps) => {
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localRemovedIds, setLocalRemovedIds] = React.useState<string[]>(removedIds);
  const [isSelectMode, setIsSelectMode] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  // Format item name to title case
  const formatItemName = (name: string): string => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format deliveries with title case names
  const formattedDeliveries = React.useMemo(() => {
    return deliveries.map(item => ({
      ...item,
      name: formatItemName(item.name)
    }));
  }, [deliveries]);

  // Filter out removed items
  const activeDeliveries = React.useMemo(() => {
    return formattedDeliveries.filter(item => !localRemovedIds.includes(item.id));
  }, [formattedDeliveries, localRemovedIds]);

  // Filter by search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return activeDeliveries;
    const query = searchQuery.toLowerCase();
    return activeDeliveries.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }, [activeDeliveries, searchQuery]);

  // Check if all items have been swiped
  const allItemsSwiped = React.useMemo(() => {
    return deliveries.length > 0 && localRemovedIds.length === deliveries.length;
  }, [deliveries.length, localRemovedIds.length]);

  const handleSearch = (value: string | number) => {
    const query = value.toString();
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSwipeComplete = (id: string) => {
    setLocalRemovedIds(prev => [...prev, id]);
    onSwipeComplete?.(id);
    // Remove from selection if selected
    if (selectedItems.has(id)) {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleItemPress = (item: DeliveryItem) => {
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
    setSelectedItems(prev => {
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
      const allIds = filteredData.map(item => item.id);
      setSelectedItems(new Set(allIds));
    }
  };

  const handleCancelSelect = () => {
    setIsSelectMode(false);
    setSelectedItems(new Set());
  };

  const handleCheckMultiple = () => {
    // Mark all selected items as completed
    selectedItems.forEach(id => {
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
              <Text style={[styles.headerButtonText, { color: theme.mode === 'dark' ? palette.yellow : palette.pink }]}>
                {selectedItems.size === filteredData.length ? 'Deselect all' : 'Select all'}
              </Text>
            </TouchableOpacity>

            {/* Centered title - Check List */}
            <View style={styles.centerTitle}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
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
              <Text style={[styles.headerButtonText, { color: theme.mode === 'dark' ? palette.yellow : palette.pink }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Regular mode: Left-aligned title with paloma gradient - NO CENTERING */}
            <Text variant="gradient" gradientName="paloma" style={styles.title}>
              {title}
            </Text>
          </>
        )}
      </View>

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
                {emptyState?.title || (deliveries.length === 0
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
            style={[styles.checkMultipleButton, { backgroundColor: palette.pink }]}
            onPress={handleCheckMultiple}
            accessibilityLabel="Check multiple items"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark" size={20} color={palette.white} />
            <Text style={[styles.checkMultipleText, { color: palette.white, marginLeft: 8 }]}>
              Check multiple
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    height: 40, // Fixed height to prevent layout shift
  },
  centerTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    // Left-aligned for regular mode
  },
  headerButton: {
    width: 100, // Fixed width for alignment
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  checkMultipleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  successIcon: {
    marginBottom: 16,
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
});

export default DeliveryList;
export type { DeliveryListProps };