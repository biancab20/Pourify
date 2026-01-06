import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/shared/Text";
import InputBox from "@/components/ui/InputBox";
import ListItem from "@/components/ui/ListItem";
import { useAppTheme } from "@/stores/app-theme-context";

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
  const { colors } = theme;
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localRemovedIds, setLocalRemovedIds] = React.useState<string[]>(removedIds);

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
  };

  const handleItemPress = (item: DeliveryItem) => {
    onItemPress?.(item);
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
      {/* Title */}
      <Text variant="gradient" gradientName="paloma" style={styles.title}>
        {title}
      </Text>

      {/* Search */}
      {showSearch && (
        <InputBox
          placeholder={searchPlaceholder}
          initialValue=""
          onSearch={handleSearch}
        />
      )}

      {/* Results count */}
      {showResultsCount && searchQuery && (
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
            />
          )}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Summary footer */}
      {filteredData.length > 0 && (
        <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {activeDeliveries.length - filteredData.length === 0
              ? "All items visible"
              : `${activeDeliveries.length - filteredData.length} item${activeDeliveries.length - filteredData.length !== 1 ? 's' : ''} hidden by search`}
          </Text>
          <Text style={[styles.completedText, { color: theme.palette.pink }]}>
            {localRemovedIds.length} item{localRemovedIds.length !== 1 ? 's' : ''} completed
          </Text>
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
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
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
  summaryContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  completedText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DeliveryList;
export type { DeliveryListProps };