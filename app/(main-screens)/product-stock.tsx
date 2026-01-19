import { Text } from "@/components/shared/Text";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularChart from "@/components/dynamicComponents/CircularChart";
import DatePicker, { Mode } from "@/components/dynamicComponents/DatePicker";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import StockDropdownNavigation from "@/components/dynamicComponents/StockDropdownLocationPicker";
import { useBars } from "@/hooks/useLocations";
import { Bar } from "@/types/locations";
import { useStocks } from "@/hooks/useStock";
import BarStockCard from "@/components/dynamicComponents/BarStockCard";
import TotalStockSummary from "@/components/dynamicComponents/TotalStockSummary";
import InfoCard from "@/components/dynamicComponents/InfoBox";
import { StockItem } from "@/types/stock";
import AndroidCustomNavigation from "@/components/navigation/AndroidCustomNavigation";

export default function ProductDetails() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const params = useLocalSearchParams();

  const [mode, setMode] = useState<Mode>("Week");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedBar, setSelectedBar] = useState<{
    id: string | null;
    name: string;
  }>({
    id: null,
    name: "General Stock",
  });

  // Extract product info from params
  const productId = Array.isArray(params.productId)
    ? params.productId[0]
    : params.productId || "";
  const productName = Array.isArray(params.productName)
    ? params.productName[0]
    : params.productName || "Product";
  const productVolume = Array.isArray(params.productVolume)
    ? params.productVolume[0]
    : params.productVolume || "0";
  const parsedProductVolume = parseFloat(productVolume);

  // Hooks
  const { data: barsData, isLoading: barsLoading } = useBars();
  const { data: stocksData, isLoading: stocksLoading } = useStocks();

  // Memoized arrays
  const bars = useMemo(() => barsData?.value || [], [barsData?.value]);
  const stocks = useMemo(() => stocksData?.value || [], [stocksData?.value]);

  // Stock per bar for current product
  const productStockByBar = useMemo(() => {
    const stockMap = new Map<
      string,
      { totalVolume: number; bottleCount: number }
    >();

    // Initialize all bars
    bars.forEach((bar) =>
      stockMap.set(bar.barId, { totalVolume: 0, bottleCount: 0 }),
    );

    // Fill in stock
    stocks.forEach((stock: StockItem) => {
      if (stock.productId === productId) {
        // Stock bar ID
        const barId = stock.storagePlaceId;
        const existing = stockMap.get(barId) || {
          totalVolume: 0,
          bottleCount: 0,
        };
        const bottleCount =
          parsedProductVolume > 0
            ? Math.floor(stock.volume / parsedProductVolume)
            : 0;

        stockMap.set(barId, {
          totalVolume: existing.totalVolume + stock.volume,
          bottleCount: existing.bottleCount + bottleCount,
        });
      }
    });

    return stockMap;
  }, [stocks, bars, productId, parsedProductVolume]);

  // Total stock across all bars
  const totalStock = useMemo(() => {
    let totalVolume = 0;
    let totalBottles = 0;
    productStockByBar.forEach((stock) => {
      totalVolume += stock.totalVolume;
      totalBottles += stock.bottleCount;
    });
    return { totalVolume, totalBottles };
  }, [productStockByBar]);

  // Initialize selected bar from params
  useEffect(() => {
    const barIdParam = Array.isArray(params.barId)
      ? params.barId[0]
      : params.barId || "";
    const barNameParam = Array.isArray(params.barName)
      ? params.barName[0]
      : params.barName || "";

    if (barIdParam && barNameParam) {
      setSelectedBar({ id: barIdParam, name: barNameParam });
    }
  }, [params.barId, params.barName]);

  const selectedBarStock = selectedBar.id
    ? productStockByBar.get(selectedBar.id)
    : null;
  const isGeneralStock = !selectedBar.id;

  const handleBarSelect = (bar: { id: string | null; name: string }) => {
    setSelectedBar(bar);
    router.push({
      pathname: "/product-stock",
      params: {
        productId,
        productName,
        productVolume,
        barId: bar.id || "",
        barName: bar.name,
      },
    });
  };

  const chartData = { ordered: 42, poured: 30, sold: 28.56 }; // Example

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={Platform.OS === "android" ? ["bottom", "top"] : []}
    >
      {Platform.OS === "android" && (
        <AndroidCustomNavigation onBack={router.back} paddingHorizontal={10} />
      )}
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {productName}
          </Text>
          <StockDropdownNavigation
            bars={bars}
            selectedBar={selectedBar}
            onBarSelect={handleBarSelect}
          />
        </View>

        <DatePicker
          mode={mode}
          setMode={setMode}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />

        <View style={styles.chartWrapper}>
          <CircularChart data={chartData} mode={mode} />
        </View>

        {/* Selected bar stock or total */}
        {!isGeneralStock && selectedBarStock ? (
          <WideCardStatic>
            <Text style={[styles.popularDrinkTitle, { color: colors.text }]}>
              In {selectedBar.name}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.text }]} />
            <View style={styles.row}>
              <InfoCard
                title={`${selectedBarStock.totalVolume.toFixed(1)}L`}
                subtitle="#Litres"
                style={{ width: "45%", marginRight: 10 }}
              />
              <InfoCard
                title={selectedBarStock.bottleCount.toString()}
                subtitle="#Bottles"
                style={{ width: "45%" }}
              />
            </View>
          </WideCardStatic>
        ) : (
          <TotalStockSummary
            totalVolume={totalStock.totalVolume}
            totalBottles={totalStock.totalBottles}
          />
        )}

        {/* Stock in all bars */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isGeneralStock ? "Stock in all bars" : "Available in other bars"}
          </Text>

          {barsLoading || stocksLoading ? (
            <Text
              style={{ color: colors.text, textAlign: "center", marginTop: 20 }}
            >
              Loading stock data...
            </Text>
          ) : bars.length === 0 ? (
            <Text
              style={{ color: colors.text, textAlign: "center", marginTop: 20 }}
            >
              No bars found
            </Text>
          ) : (
            <View style={styles.cardsRow}>
              {bars.map((bar: Bar) => {
                const stock = productStockByBar.get(bar.barId);
                if (isGeneralStock || bar.barId !== selectedBar.id) {
                  return (
                    <BarStockCard
                      key={bar.barId}
                      barName={bar.name}
                      totalVolume={stock?.totalVolume || 0}
                      bottleCount={stock?.bottleCount || 0}
                      productVolume={parsedProductVolume}
                      totalStockAcrossAllBars={totalStock.totalVolume}
                    />
                  );
                }
                return null;
              })}
            </View>
          )}
        </View>

        {/* Modify Stock button */}
        {!isGeneralStock && selectedBarStock && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Modify Stock
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/edit-stock",
                  params: {
                    productId,
                    productName,
                    productVolume,
                    barId: selectedBar.id,
                    barName: selectedBar.name,
                    currentStock: selectedBarStock.bottleCount.toString(),
                  },
                })
              }
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
                  style={{ color: "white", fontWeight: "700", fontSize: 18 }}
                >
                  Adjust Stock
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 5 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionContainer: { marginTop: 24 },
  popularDrinkTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 0,
  },
  sectionTitle: { fontSize: 24, fontWeight: "700", flex: 1, marginRight: 16 },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 0,
    gap: 10,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 13 },
  row: { flexDirection: "row", marginTop: 10 },
  stockButton: {
    width: "100%",
    marginBottom: 60,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "center",
  },
  chartWrapper: { alignItems: "center", marginBottom: 8 },
});
