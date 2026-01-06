// app/(main-screens)/product-stock.tsx
import { Text } from "@/components/shared/Text";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularChart from "@/components/ui/CircularChart"; 
import DatePicker, { Mode } from "@/components/ui/DatePicker";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import StockDropdownNavigation from "@/components/ui/StockDropdownNavigation";
import { useBars } from "@/hooks/useLocations";
import { Bar } from "@/types/locations";
import { useStocks } from "@/hooks/useStock";
import { useProducts } from "@/hooks/useProducts";
import BarStockCard from "@/components/ui/BarStockCard";
import TotalStockSummary from "@/components/ui/TotalStockSummary";
import InfoCard from "@/components/ui/InfoBox";
import { StockItem } from "@/types/stock"; // Import StockItem type

export default function ProductDetails() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const params = useLocalSearchParams();

  const [mode, setMode] = useState<Mode>("Week");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedBar, setSelectedBar] = useState<{ id: string | null; name: string }>({
    id: null,
    name: "General Stock",
  });

  // Get product ID from params
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId || "";
  const productName = Array.isArray(params.productName) ? params.productName[0] : params.productName || "Product";
  const productVolume = Array.isArray(params.productVolume) ? params.productVolume[0] : params.productVolume || "0";
  
  const parsedProductVolume = parseFloat(productVolume);

  // Data hooks
  const { data: barsData, isLoading: barsLoading } = useBars();
  const { data: productsData } = useProducts();
  const { data: stocksData, isLoading: stocksLoading } = useStocks();

  // Memoized arrays
  const bars = useMemo(() => barsData?.items || [], [barsData?.items]);
  const stocks = useMemo(() => stocksData?.items || [], [stocksData?.items]);
  const products = useMemo(() => productsData?.items || [], [productsData?.items]);

  // Find current product
  const currentProduct = useMemo(() => {
    return products.find(p => p.productId.toString() === productId);
  }, [products, productId]);

  // Get stock data for this product across all bars
  const productStockByBar = useMemo(() => {
    const stockMap = new Map<string, { totalVolume: number; bottleCount: number }>();
    
    // Initialize all bars with zero stock
    bars.forEach(bar => {
      stockMap.set(bar.barId, { totalVolume: 0, bottleCount: 0 });
    });

    // Add actual stock data
    stocks.forEach((stock: StockItem) => {
      // Check if this stock belongs to the current product
      // Note: You may need to check the actual property name from your StockItem type
      if (stock.productId.toString() === productId) {
        // Check which bar this stock belongs to
        // This depends on your StockItem type structure
        // If StockItem has locationId or barId property, use that
        const barId = (stock as any).barId || (stock as any).locationId || (stock as any).BarId;
        
        if (barId) {
          const currentStock = stockMap.get(barId.toString()) || { totalVolume: 0, bottleCount: 0 };
          const bottleCount = parsedProductVolume > 0 ? Math.floor(stock.volume / parsedProductVolume) : 0;
          
          stockMap.set(barId.toString(), {
            totalVolume: stock.volume,
            bottleCount: bottleCount,
          });
        }
      }
    });

    return stockMap;
  }, [stocks, bars, productId, parsedProductVolume]);

  // Calculate totals
  const totalStock = useMemo(() => {
    let totalVolume = 0;
    let totalBottles = 0;
    
    productStockByBar.forEach(stock => {
      totalVolume += stock.totalVolume;
      totalBottles += stock.bottleCount;
    });

    return { totalVolume, totalBottles };
  }, [productStockByBar]);

  // Initialize selected bar from params
  useEffect(() => {
    const barIdParam = Array.isArray(params.barId) ? params.barId[0] : params.barId || "";
    const barNameParam = Array.isArray(params.barName) ? params.barName[0] : params.barName || "";

    if (barIdParam && barNameParam) {
      setSelectedBar({ id: barIdParam, name: barNameParam });
    }
  }, [params.barId, params.barName]);

  // Get stock for selected bar
  const selectedBarStock = selectedBar.id ? productStockByBar.get(selectedBar.id) : null;

  const isGeneralStock = !selectedBar.id;

  const handleBarSelect = (bar: { id: string | null; name: string }) => {
    setSelectedBar(bar);
    
    // Navigate to the product details with the selected bar
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

  const chartData = {
    ordered: 42,
    poured: 30,
    sold: 28.56
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
        {/* Header with Product Name and Dropdown */}
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{productName}</Text>
          
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

        {/* Show selected bar stock or total stock */}
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
                style={{ width: '45%', marginRight: 10 }} 
              />
              <InfoCard 
                title={selectedBarStock.bottleCount.toString()} 
                subtitle="#Bottles" 
                style={{ width: '45%' }} 
              />
            </View>
          </WideCardStatic>
        ) : (
          <TotalStockSummary 
            totalVolume={totalStock.totalVolume}
            totalBottles={totalStock.totalBottles}
          />
        )}

        {/* Show stock in all bars */}
<View style={styles.sectionContainer}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>
    {isGeneralStock ? "Stock in all bars" : "Available in other bars"}
  </Text>

  {(barsLoading || stocksLoading) ? (
    <Text style={{ color: colors.text, textAlign: "center", marginTop: 20 }}>
      Loading stock data...
    </Text>
  ) : bars.length === 0 ? (
    <Text style={{ color: colors.text, textAlign: "center", marginTop: 20 }}>
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
              totalStockAcrossAllBars={totalStock.totalVolume} // Pass total stock
            />
          );
        }
        return null;
      })}
    </View>
  )}
</View>

        {!isGeneralStock && selectedBarStock && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Modify Stock</Text>

            <Pressable
              onPress={() => router.push({
                pathname: "/edit-stock",
                params: {
                  productId: productId,
                  productName: productName,
                  productVolume: productVolume,
                  barId: selectedBar.id,
                  barName: selectedBar.name,
                  currentStock: selectedBarStock.bottleCount.toString()
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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
    flex: 1,
    marginRight: 16,
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