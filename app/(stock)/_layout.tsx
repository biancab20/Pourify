import { Stack } from "expo-router";

export default function StockLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="all-products-page" />
      <Stack.Screen name="step2" />
      {/* more steps if you need them */}
    </Stack>
  );
}
