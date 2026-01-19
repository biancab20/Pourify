import { Text } from "@/components/shared/Text";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import { useAppTheme } from "@/stores/app-theme-context";
import React from "react";
import { StyleSheet, View } from "react-native";
import InfoCard from "./InfoBox";

interface TotalStockSummaryProps {
  totalVolume: number;
  totalBottles: number;
}

export default function TotalStockSummary({
  totalVolume,
  totalBottles,
}: TotalStockSummaryProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <WideCardStatic>
      <Text style={[styles.totalTitle, { color: colors.text }]}>Total</Text>

      <View style={[styles.divider, { backgroundColor: colors.text }]} />

      <View style={styles.row}>
        <InfoCard
          title={`${totalVolume.toFixed(1)}L`}
          subtitle="#Litres"
          style={{ width: "45%", marginRight: 10 }}
        />
        <InfoCard
          title={totalBottles.toString()}
          subtitle="#Bottles"
          style={{ width: "45%" }}
        />
      </View>
    </WideCardStatic>
  );
}

const styles = StyleSheet.create({
  totalTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 13,
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
  },
});
