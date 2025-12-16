import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Icon } from "../icons/Icon";

interface SearchInputProps {
  onSearch: (text: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search ...",
  initialValue = "",
}: SearchInputProps) {
  const { theme } = useAppTheme();
  const { palette } = theme;

  const [searchText, setSearchText] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchText("");
    onSearch("");
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
      accessibilityLabel="Search bar"
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
        onChangeText={(text) => {
          setSearchText(text);
          onSearch(text);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        cursorColor={palette.yellow}
        selectionColor={`${palette.yellow}50`}
      />

      {searchText.length > 0 && (
        <Pressable style={styles.clearButton} onPress={handleClear} accessibilityRole="button" accessibilityLabel="Clear search">
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
