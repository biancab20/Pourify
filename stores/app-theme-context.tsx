// theme/AppThemeProvider.tsx
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
  // core semantic colors used in components
  //add anything that can change with theme

  //   primary: string;
  //   accent: string;

  background: string;
  //   backgroundAlt: string;
  //   surface: string;

  text: string;
  //   textMuted: string;
  //   onPrimary: string;
  //   onSurface: string;

  //   border: string;

  //   success: string;
  //   danger: string;
  //   warning: string;

  cardBackground: string;
  cardText: string;
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
  paloma: {
    colors: string[]; // gradient colors
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  bananaDaiquiri: {
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
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

// ------- YOUR BRAND PALETTE -------

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
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 }, // vertical gradient (top → bottom)
  },
};

// You can still define generic status colors or reuse from palette
// const SUCCESS = PALETTE.green;
// const DANGER = PALETTE.red;
// const WARNING = PALETTE.yellow;

// ------- LIGHT & DARK TOKEN MAPPING -------

// light mode → background = beige
const lightColors: ColorTokens = {
  //   primary: PALETTE.blue,      // pick what feels like your main brand
  //   accent: PALETTE.yellow,

  background: PALETTE.beige, // ✅ as you requested
  //   backgroundAlt: "#FFFFFF",
  //   surface: "#FFFFFF",

  text: "#101320",
  //   textMuted: "#6B7280",
  //   onPrimary: "#031836",       // dark blue text on blue-ish buttons
  //   onSurface: "#101320",

  //   border: "#D4D4D4",

  //   success: SUCCESS,
  //   danger: DANGER,
  //   warning: WARNING,
  cardBackground: "#FFFFFF",
  cardText: "#101320",
};

// dark mode → background = dark blue
const darkColors: ColorTokens = {
  background: PALETTE.darkBlue, 

  text: "#F9FAFB",
  cardBackground: "#000000",
  cardText: "#F9FAFB",
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
