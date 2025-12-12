import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

type ColorTokens = {
  background: string;
  text: string;
  cardBackground: string;
  cardText: string;
  icon: string;
};

type GradientDefinition = {
  colors: [string, string]; // exactly 2 colors
  start: { x: number; y: number };
  end: { x: number; y: number };
};

// 👇 brand palette (your raw colors)
export type BrandPalette = {
  beige: string;
  red: string;
  pink: string;
  green: string;
  blue: string;
  yellow: string;
  darkRed: string;
  darkPurple: string;
  darkGreen: string;
  darkBlue: string;
  white: string;
  black: string;

  // NEW: gradient
  paloma: GradientDefinition;
  bananaDaiquiri: GradientDefinition;
};

export type AppTheme = {
  mode: "light" | "dark"; // resolved mode
  colors: ColorTokens; // semantic tokens
  palette: BrandPalette; // raw brand colors
  isDark: boolean;
};

type AppThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined
);

// ------- BRAND PALETTE -------

const PALETTE: BrandPalette = {
  beige: "#ECECDB",
  red: "#F54D41",
  pink: "#FF77E0",
  green: "#00C264",
  blue: "#00D4CA",
  yellow: "#D9E734",
  darkRed: "#760C05",
  darkPurple: "#370732",
  darkGreen: "#2C6253",
  darkBlue: "#031836",
  white: "#FFFFFF",
  black: "#000000",

  // NEW: gradient
  paloma: {
    colors: ["#FF77E0", "#F54D41"],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  bananaDaiquiri: {
    colors: ["#D9E734", "#00C264"],
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0.5 }, // vertical gradient (top → bottom)
  },
};

// You can still define generic status colors or reuse from palette
// const SUCCESS = PALETTE.green;
// const DANGER = PALETTE.red;
// const WARNING = PALETTE.yellow;

// ------- LIGHT & DARK TOKEN MAPPING -------

// light mode
const lightColors: ColorTokens = {
  background: PALETTE.beige,
  text: "#101320",
  cardBackground: PALETTE.white,
  cardText: "#101320",
  icon: PALETTE.darkBlue,
};

// dark mode
const darkColors: ColorTokens = {
  background: PALETTE.darkBlue, 
  text: "#F9FAFB",
  cardBackground: PALETTE.black,
  cardText: "#F9FAFB",
  icon: PALETTE.beige,
};

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState<ThemeMode>("system");

  const resolvedMode: "light" | "dark" =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const theme: AppTheme = useMemo(
    () => ({
      mode: resolvedMode,
      isDark: resolvedMode === "dark",
      colors: resolvedMode === "dark" ? darkColors : lightColors,
      palette: PALETTE,
    }),
    [resolvedMode]
  );

  const value: AppThemeContextValue = useMemo(
    () => ({
      theme,
      mode,
      setMode,
      toggleMode: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [theme, mode]
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }
  return ctx;
}
