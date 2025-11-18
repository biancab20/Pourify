import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/SearchBar";
import { useAppTheme } from "@/stores/app-theme-context";

export default function AllProducts() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;

  const handleSearch = (searchText: string) => {
    console.log("Searching for:", searchText);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search ..."
        initialValue=""
      />

      <Text style={[styles.title, { color: colors.text }]}>Second flow – Step 1</Text>

      <Pressable
        style={[styles.button, { backgroundColor: palette.darkBlue }]}
        onPress={() => router.push("/(stock)/product-detail-page")}
      >
        <Text style={styles.buttonText}>Some Product Here</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondary, { borderColor: palette.darkBlue }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.secondaryText, { color: palette.darkBlue }]}>Back to Home</Text>
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
    marginTop: 20,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 12,
    alignSelf: "center",
  },
  buttonText: { 
    color: "white", 
    fontWeight: "600" 
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  secondaryText: { 
    fontWeight: "600" 
  },
});