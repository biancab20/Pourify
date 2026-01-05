import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/InputBox";
import ListItem from "@/components/ui/ListItem";
import { useAppTheme } from "@/stores/app-theme-context";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

type DeliveryItem = {
  id: string;
  name: string;
  cases: number;
  cans: number;
};

export default function DeliveryList() {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const [searchQuery, setSearchQuery] = useState("");
  
  // Change from useMemo to useState so we can update it
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([
    { id: "1", name: "Strawberry 250ml", cases: 20, cans: 12 },
    { id: "2", name: "Cola 330ml", cases: 10, cans: 24 },
    { id: "3", name: "Lime Soda 200ml", cases: 15, cans: 6 },
    { id: "4", name: "Orange Juice 1L", cases: 8, cans: 0 },
    { id: "5", name: "Tonic Water 200ml", cases: 18, cans: 30 },
  ]);

  const handleSwipeComplete = (id: string) => {
    // Remove the item from the deliveries array
    setDeliveries(prev => prev.filter(item => item.id !== id));
    
    // Optional: Show a toast or confirmation message
    console.log(`Delivery ${id} completed and removed`);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return deliveries;

    const query = searchQuery.toLowerCase();
    return deliveries.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [deliveries, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="gradient" gradientName="paloma" style={styles.title}>
        Check delivery list
      </Text>

      <SearchBar
        placeholder="Search deliveries..."
        initialValue=""
        onSearch={setSearchQuery}
      />

      {searchQuery && (
        <Text style={[styles.resultsText, { color: colors.text }]}>
          {filteredData.length} result
          {filteredData.length !== 1 ? "s" : ""}
        </Text>
      )}

      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            {deliveries.length === 0 
              ? "All deliveries completed! 🎉" 
              : "No deliveries match your search"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem 
              delivery={item} 
              onSwipeComplete={handleSwipeComplete}
            />
          )}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
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
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 40,
  },
});