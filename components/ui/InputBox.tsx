import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Icon } from "../icons/Icon";

interface InputBarProps {
  onSearch: (value: string | number) => void;
  placeholder?: string;
  initialValue?: string;
  type?: "text" | "number";
  min?: number;
  max?: number;
  decimal?: boolean;
  maxDecimalDigits?: number;
}

export default function InputBar({
  onSearch,
  placeholder = "Search ...",
  initialValue = "",
  type = "text",
  min,
  max,
  decimal = false,
  maxDecimalDigits = 2,
}: InputBarProps) {
  const { theme } = useAppTheme();
  const { palette } = theme;

  const [searchText, setSearchText] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchText("");
    onSearch("");
  };

  const handleTextChange = (text: string) => {
    if (type === "number") {
      // Handle numeric input
      const numericRegex = decimal 
        ? new RegExp(`^-?\\d*\\.?\\d{0,${maxDecimalDigits}}$`)
        : /^-?\d*$/;
      
      // Allow empty string
      if (text === "" || numericRegex.test(text)) {
        // Check min/max constraints
        if (text && text !== "-" && text !== ".") {
          const numValue = parseFloat(text);
          
          if (min !== undefined && numValue < min) {
            const limitedValue = min.toString();
            setSearchText(limitedValue);
            onSearch(decimal ? parseFloat(limitedValue) : parseInt(limitedValue, 10));
            return;
          }
          
          if (max !== undefined && numValue > max) {
            const limitedValue = max.toString();
            setSearchText(limitedValue);
            onSearch(decimal ? parseFloat(limitedValue) : parseInt(limitedValue, 10));
            return;
          }
        }
        
        setSearchText(text);
        // Pass appropriate type to onSearch
        if (text === "" || text === "-" || text === ".") {
          onSearch("");
        } else {
          onSearch(decimal ? parseFloat(text) : parseInt(text, 10));
        }
      }
    } else {
      // Regular text input
      setSearchText(text);
      onSearch(text);
    }
  };

  const getKeyboardType = () => {
    if (type === "number") {
      return decimal ? "decimal-pad" : "number-pad";
    }
    return "default";
  };

  const borderColor = theme.isDark
    ? isFocused
      ? "#FFFFFF"
      : "#565656"
    : isFocused
    ? "#000000"
    : "#8B8B8B";

  const placeholderColor = theme.isDark ? "#565656" : "#8B8B8B";

  return (
    <View
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor: theme.isDark ? palette.black : palette.white,
        },
      ]}
      accessibilityRole="search"
      accessibilityLabel={type === "number" ? "Number input" : "Search bar"}
    >
      <TextInput
        style={[
          styles.input,
          {
            color: theme.isDark ? palette.white : palette.black,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={searchText}
        onChangeText={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        cursorColor={palette.yellow}
        selectionColor={`${palette.yellow}50`}
        keyboardType={getKeyboardType()}
        inputMode={type === "number" ? (decimal ? "decimal" : "numeric") : "text"}
      />

      {searchText.length > 0 && (
        <Pressable 
          style={styles.clearButton} 
          onPress={handleClear} 
          accessibilityRole="button" 
          accessibilityLabel="Clear input"
        >
          <Icon name="delete" size={20} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    borderWidth: 0.5,
    width: "100%",
    alignSelf: "center",
    maxHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 13,
    paddingLeft: 20,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  clearButton: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});