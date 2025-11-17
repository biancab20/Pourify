import React from "react";
import { View, Text, StyleSheet } from "react-native";



export default function InformationCard() {
  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Main Bar</Text>

      <View style={styles.circleWrapper}>
        <View style={styles.backgroundCircle} />
        <View style={styles.progressCircle} />

        <View style={styles.centerContent}>
          <Text style={styles.labelText}>Poured % of Goal</Text>
          <Text style={styles.largeNumber}>10%</Text>

          <Text style={[styles.labelText, { marginTop: 8 }]}>
            Actual vs POS
          </Text>
          <Text style={styles.largeNumber}>-40%</Text>
          <Text style={styles.labelText}>-40mL</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bacardi</Text>
        <Text style={styles.cardSubtitle}>Most popular product</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>3</Text>
        <Text style={styles.cardSubtitle}>#Pours</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    padding: 20,
    backgroundColor: "#000814",
    borderRadius: 20,
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 25,
  },

  circleWrapper: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  backgroundCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 12,
    borderColor: "#240000", 
  },

  progressCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 12,
    borderColor: "transparent",
    borderTopColor: "#ff4d4d", 
    transform: [{ rotate: "20deg" }],
  },

  centerContent: {
    alignItems: "center",
  },

  labelText: {
    color: "#cccccc",
    fontSize: 12,
  },

  largeNumber: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },

  card: {
    width: "100%",
    backgroundColor: "#00204d",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 15,
    alignItems: "center",
  },

  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#dddddd",
    fontSize: 14,
  },
});
