import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import SearchBar from "@/components/ui/SearchBar";

export default function EditStock() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;

  const handleSearch = (searchText: string) => {
    console.log("Searching for:", searchText);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Edit Stock</Text>

      {/* Info Text */}
      <Text style={[styles.infoText, { color: colors.text }]}>
        You are trying to adjust the quantity of Aperol bottles. Please input the amount of full bottles that you see.
      </Text>

      {/* Search Box */}
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search for products..."
        initialValue=""
      />

      {/* Adjust Button */}
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

      {/* Back Button */}
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
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "600", 
    marginBottom: 24,
    textAlign: "center",
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
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { 
    color: "white", 
    fontWeight: "700", 
    fontSize: 18 
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 12,
    alignSelf: "center",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  secondaryText: { 
    fontWeight: "600",
    fontSize: 16,
  },
});