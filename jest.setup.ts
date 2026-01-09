/* eslint-disable @typescript-eslint/no-require-imports */
// Router mock 
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

(globalThis as any).__mockPush = mockPush;

// Safe area mock
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// Theme mock
jest.mock("@/stores/app-theme-context", () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        background: "#fff",
        text: "#111",
        icon: "#222",
        cardBackground: "#eee",
      },
      palette: {
        blue: "#00f",
        red: "#f00",
        paloma: {
          colors: ["#000", "#111"],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        },
        bananaDaiquiri: {
          colors: ["#222", "#333"],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        },
      },
    },
  }),
}));

// Make shared Text a plain RN Text 
jest.mock("@/components/shared/Text", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const TextMock = ({ children, ...props }: any) =>
    React.createElement(Text, props, children);
  TextMock.displayName = "TextMock";

  return { Text: TextMock };
});

// Make LinearGradient a simple View
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");

  const LinearGradient = ({ children, ...props }: any) =>
    React.createElement(View, props, children);
  LinearGradient.displayName = "LinearGradientMock";

  return { LinearGradient };
});

afterEach(() => {
  (globalThis as any).__mockPush?.mockClear?.();
});