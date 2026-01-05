import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/InputBox";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet } from "react-native";

export default function EditStock() {
  const { theme } = useAppTheme();
  const { colors } = theme;

  // For number input, the callback receives a number or empty string
  const handleNumberInput = (value: string | number) => {
    console.log("Number entered:", value);
    console.log("Type:", typeof value);
    // You can handle the number value here
    if (value !== "") {
      const numericValue = typeof value === 'number' ? value : parseFloat(value as string);
      console.log("Numeric value:", numericValue);
    }
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

      {/* Number Input - Only allows numbers */}
      <SearchBar
        type="number" 
        onSearch={handleNumberInput}
        placeholder=""
        initialValue=""
        min={0}  
        decimal={false}  // No decimals for bottle count
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