import { Text } from "@/components/shared/Text";
import InformationCard from "@/components/staticComponents/InformationCardStatic";
import InfoCard from "@/components/ui/InfoBox";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import CircularChart from "@/components/ui/CircularChart"; 
import DatePicker, { Mode } from "@/components/ui/DatePicker";
import { useState } from "react";
import dayjs from "dayjs";
import { dummyData, Bar } from "@/types/DummyData";

export default function ProductDetails() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const params = useLocalSearchParams();

  const [mode, setMode] = useState<Mode>("Week");
  const [currentDate, setCurrentDate] = useState(dayjs());

  const chartData = {
    ordered: 42,
    poured: 30,
    sold: 28.56
  };

  const bars = dummyData.bars.items;

  // Get the product data from navigation params and ensure they are strings
  const productName = Array.isArray(params.productName) ? params.productName[0] : params.productName || "Product";
  const productVolume = Array.isArray(params.productVolume) ? params.productVolume[0] : params.productVolume || "0";
  const productType = Array.isArray(params.productType) ? params.productType[0] : params.productType || "";
  const totalVolume = Array.isArray(params.totalVolume) ? params.totalVolume[0] : params.totalVolume || "0";
  const bottleCount = Array.isArray(params.bottleCount) ? params.bottleCount[0] : params.bottleCount || "0";
  const barName = Array.isArray(params.barName) ? params.barName[0] : params.barName || "";
  const barId = Array.isArray(params.barId) ? params.barId[0] : params.barId || "";

  // Parse numeric values
  const parsedProductVolume = parseFloat(productVolume);
  const parsedTotalVolume = parseFloat(totalVolume);
  const parsedBottleCount = parseInt(bottleCount);

  // Check if we're viewing General Stock or a specific bar
  const isGeneralStock = !barName || barName === "General Stock";

  return (
    <ScrollView 
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{productName}</Text>

        <DatePicker 
          mode={mode}
          setMode={setMode}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
        <View style={styles.chartWrapper}>
          <CircularChart data={chartData} mode={mode} />
        </View>

        {/* Only show WideCardStatic section for specific bars, not General Stock */}
        {!isGeneralStock && (
          <WideCardStatic>
            <Text style={[styles.popularDrinkTitle, { color: colors.text }]}>{barName}</Text>

            <View style={[styles.divider, { backgroundColor: colors.text }]} />

            <View style={styles.row}>
              <InfoCard 
                title={`${parsedTotalVolume} L`} 
                subtitle="#Litres" 
                style={{ width: '45%', marginRight: 10 }} 
              />
              <InfoCard 
                title={parsedBottleCount.toString()} 
                subtitle="#Bottles" 
                style={{ width: '45%' }} 
              />
            </View>
          </WideCardStatic>
        )}
      </View>

      {/* Always show "Poured today in your bars" section - for both General Stock and specific bars */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available in other bars</Text>

        <View style={styles.cardsRow}>
          {bars.map((bar: Bar) => (
            <InformationCard key={bar.barId} barName={bar.name} />
          ))}
        </View>
      </View>

      {/* Only show "Modify Stock" section for specific bars, not General Stock */}
      {!isGeneralStock && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Modify Stock</Text>

          <Pressable
            onPress={() => router.push({
              pathname: "/(stock)/edit-stock",
              params: {
                productId: params.productId as string,
                productName: productName,
                productVolume: productVolume,
                barId: barId,
                barName: barName,
                currentStock: parsedBottleCount.toString()
              }
            })}
            style={styles.stockButton}
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
              <Text
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: 18,
                }}
              >
                Adjust Stock
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 16,
    paddingTop: 40 
  },
  sectionContainer: {
    marginTop: 24,
  },
  popularDrinkTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
  },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 0,
    gap: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 13,
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
  },
  stockButton: {
    width: "100%",
    marginBottom: 60,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "center",
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
});