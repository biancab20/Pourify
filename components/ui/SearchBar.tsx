import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

export interface SearchInputProps {
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

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: palette.white,
          backgroundColor: theme.isDark ? palette.black : palette.white,
        },
      ]}
    >
      <TextInput
        style={[
          styles.input,
          {
            color: theme.isDark ? palette.white : palette.black,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.isDark ? palette.beige : palette.darkBlue}
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
        <Pressable
          style={[
            styles.clearButton,
            { backgroundColor: palette.pink },
          ]}
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>×</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderWidth: 0.5,
    width: "100%",
    alignSelf: "center",
  },
  input: {
    flex: 1,
    fontSize: 18,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  clearButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 20,
    textAlignVertical: "center",
  },
});
