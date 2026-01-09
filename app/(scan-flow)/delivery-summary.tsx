// DeliverySummary.tsx
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { useDeliveryStatus } from "@/hooks/useDeliveryStatus";
import ListItem, { DeliveryItem } from "@/components/ui/ListItem";
import GradientButton from "@/components/shared/GradientButton";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import InputBox from "@/components/ui/InputBox";
import EditableSectionCard from "@/components/ui/EditableSectionCard";

type SectionProps = {
  title: string;
  items: DeliveryItem[];
  searchQuery: string;
};

function Section({ title, items, searchQuery }: SectionProps) {
  if (items.length === 0) return null;

  // Filter section items by search query
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      const productName = toTitleCase(item.name);
      return (
        productName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery]);

  if (filteredItems.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {filteredItems.map(item => (
        <ListItem 
          key={item.id} 
          delivery={{
            ...item,
            name: toTitleCase(item.name)
          }} 
          readOnly 
        />
      ))}
    </View>
  );
}

// Helper function to convert string to Title Case
const toTitleCase = (str: string): string => {
  if (!str) return str;
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function DeliverySummary() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const queryClient = useQueryClient();

  const { getAll } = useDeliveryStatus();
  const [searchQuery, setSearchQuery] = useState("");

  // Get OCR data to extract supplier and date
  const ocrResponse = queryClient.getQueryData<any>(["deliveries", "latest"]) ?? null;
  
  const delivery = useMemo(() => {
    if (!ocrResponse) return null;
    return Array.isArray(ocrResponse) ? ocrResponse[0] : ocrResponse;
  }, [ocrResponse]);

  // Format date from OCR data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date found";
    
    try {
      // If it's already in a readable format, return as-is
      if (dateString.includes('/')) return dateString;
      
      // Try to parse and format date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Define rows for the EditableSectionCard based on OCR data
  const infoRows = useMemo(() => [
    {
      id: "supplier",
      title: "Supplier",
      value: delivery?.supplier?.name || "Supplier not detected",
      valueNumberOfLines: 1,
      onEditPress: () => {
        Alert.alert("Edit Supplier", "Edit supplier functionality");
      },
      showEdit: true,
      editA11yLabel: "Edit supplier",
    },
    {
      id: "date",
      title: "Date",
      value: formatDate(delivery?.deliveryDate),
      valueNumberOfLines: 1,
      onEditPress: () => {
        Alert.alert("Edit Date", "Edit date functionality");
      },
      showEdit: true,
      editA11yLabel: "Edit date",
    }
  ], [delivery]);

  // Get all delivery items from useDeliveryStatus and apply Title Case to names
  const all = useMemo(() => {
    const items = Object.values(getAll());
    return items.map(item => ({
      ...item,
      name: toTitleCase(item.name)
    }));
  }, [getAll]);

  // Categorize all items
  const received = all.filter(i => i.status === "received");
  const damaged = all.filter(i => i.status === "damaged");
  const missing = all.filter(i => i.status === "missing");
  const substituted = all.filter(i => i.status === "substituted");

  // Count filtered items
  const filteredItemsCount = useMemo(() => {
    if (!searchQuery.trim()) return all.length;
    
    const query = searchQuery.toLowerCase();
    return all.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    ).length;
  }, [all, searchQuery]);


  const handleSave = () => {
    // Implement save logic here
    Alert.alert("Save", "Delivery summary saved successfully!");
  };

  const handleSearch = (value: string | number) => {
    setSearchQuery(value.toString());
  };

  const showNoResults = searchQuery.trim() && filteredItemsCount === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          Delivery Summary
        </Text>

        {/* Supplier and Date Info Card - positioned first */}
        <View style={styles.infoContainer}>
          <EditableSectionCard
            rows={infoRows}
            style={styles.editableCardStyle}
          />
        </View>

        {/* Search Bar - positioned after supplier info */}
        <InputBox
          placeholder="Search items..."
          initialValue=""
          onSearch={handleSearch}
        />

        {/* Search results count */}
        {searchQuery && (
          <Text style={[styles.resultsText, { color: colors.text }]}>
            {filteredItemsCount} result{filteredItemsCount !== 1 ? "s" : ""} found
          </Text>
        )}

        {/* No results state */}
        {showNoResults ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.text}]}>
              No items found for &quot;{searchQuery}&quot;
            </Text>
          </View>
        ) : (
          <>
            <Section title="Received" items={received} searchQuery={searchQuery} />
            <Section title="Damaged" items={damaged} searchQuery={searchQuery} />
            <Section title="Missing" items={missing} searchQuery={searchQuery} />
            <Section title="Substituted" items={substituted} searchQuery={searchQuery} />
            
            {/* Show empty state when no items at all */}
            {all.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No delivery items to display
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <GradientButton 
          text="Save" 
          onPress={handleSave}
          disabled={all.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginVertical: 16,
  },
  infoContainer: {
    
  },
  editableCardStyle: {
    borderRadius: 12,
  },
  resultsText: {
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  buttonWrapper: {
    padding: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});