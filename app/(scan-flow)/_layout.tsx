import { Stack } from "expo-router";

export default function ScanFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Already presented as transparentModal by root, so here we just define step-to-step animation
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="scan-new-delivery" />
      {/* <Stack.Screen name="step2" /> */}
      {/* more steps if needed */}
    </Stack>
  );
}
