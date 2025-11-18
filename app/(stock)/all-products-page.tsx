import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/SearchBar";

export default function AllProducts() {
  const router = useRouter();

  const handleSearch = (searchText: string) => {
    console.log("Searching for:", searchText);
  };

  return (
    <ScrollView style={styles.container}>
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search products..."
        initialValue=""
      />

      <Text style={styles.title}>Second flow – Step 1</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/(stock)/product-detail-page")}
      >
        <Text style={styles.buttonText}>Some Product Here</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondary]}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryText}>Back to Home</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 20,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "600", 
    marginBottom: 24, 
    color: "#001b3a",
    marginTop: 20,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#001b3a",
    marginTop: 12,
    alignSelf: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#001b3a",
  },
  secondaryText: { color: "#001b3a", fontWeight: "600" },
});