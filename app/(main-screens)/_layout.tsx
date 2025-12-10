import { Stack } from "expo-router";

export default function MainScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="homepage" options={{headerShown: false}}/>
      <Stack.Screen name="bar-view" options={{headerShown: true}} />
    </Stack>
  );
}
