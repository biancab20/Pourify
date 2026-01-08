import React from "react";
import { FlatList, StyleSheet, View, TouchableOpacity } from "react-native";
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

  // Filter out removed items
  const activeDeliveries = React.useMemo(() => {
    return deliveries.filter(item => !localRemovedIds.includes(item.id));
  }, [deliveries, localRemovedIds]);

  // Filter by search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return activeDeliveries;
    const query = searchQuery.toLowerCase();
    return activeDeliveries.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }, [activeDeliveries, searchQuery]);

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
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSelectAll}
              accessibilityLabel="Select all"
              accessibilityRole="button"
            >
              <Ionicons name="square-outline" size={24} color={colors.text} />
              <Text style={[styles.headerButtonText, { color: colors.text, marginLeft: 8 }]}>
                {selectedItems.size === filteredData.length ? 'Deselect all' : 'Select all'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleCancelSelect}
              accessibilityLabel="Cancel selection"
              accessibilityRole="button"
            >
              <Text style={[styles.headerButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text variant="gradient" gradientName="paloma" style={styles.title}>
            {title}
          </Text>
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
        <View style={[styles.selectionFooter, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.selectionCount, { color: colors.text }]}>
            {selectedItems.size} selected
          </Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: "600",
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
  completedText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DeliveryList;
export type { DeliveryListProps };