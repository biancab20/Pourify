import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/shared/Text";

type InfoBoxProps = {
  title: string | number;
  subtitle: string;
  style?: object;
};

export default function InfoBox({ title, subtitle, style }: InfoBoxProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#00204d",
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 12,
    alignItems: "center",
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#dddddd",
    fontSize: 10,
  },
});
