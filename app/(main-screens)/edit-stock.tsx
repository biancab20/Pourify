import { StyleSheet, Pressable, ScrollView } from "react-native";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import SearchBar from "@/components/ui/SearchBar";

export default function EditStock() {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const handleSearch = (searchText: string) => {
    console.log("Searching for:", searchText);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Info Text */}
      <Text style={[styles.infoText, { color: colors.text }]}>
        You are trying to adjust the quantity of Aperol bottles. Please input
        the amount of full bottles that you see.
      </Text>

      {/* Search Box */}
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search for products..."
        initialValue=""
      />

      <Pressable
        onPress={() => console.log("Adjust stock")}
        style={styles.adjustButton}
      >
        <LinearGradient
          colors={["#FF77E0", "#F54D41"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            paddingVertical: 14,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={styles.buttonText}>Adjust</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  adjustButton: {
    width: "100%",
    marginBottom: 20,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
});
