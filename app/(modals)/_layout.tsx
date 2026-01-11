// import { useAppTheme } from "@/stores/app-theme-context";
// import { Stack } from "expo-router";
// import { Platform } from "react-native";

// export default function ModalsLayout() {
//   const { theme } = useAppTheme();
//   const { colors } = theme;
//   const isAndroid = Platform.OS === "android";
//   return (
//     <Stack
//       screenOptions={{
//         headerShown: !isAndroid,
//         headerStyle: {
//           backgroundColor: colors.background,
//         },
//         headerShadowVisible: false,
//       }}
//     >
//       <Stack.Screen
//         name="edit-field"
//         options={{
//             presentation: "modal",
//           title: "", 
//         }}
//       />
//     </Stack>
//   );
// }
