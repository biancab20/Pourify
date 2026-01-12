// components/dynamicComponents/SearchBar.tsx
import React, { useMemo, useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Icon } from "../icons/Icon";

interface SearchBarProps {
  value?: string; // ✅ optional controlled
  onChangeText?: (value: string) => void; // ✅ for controlled usage
  onSearch?: (value: string) => void; // ✅ if you still want "search callback" semantics
  placeholder?: string;
  initialValue?: string; // ✅ for uncontrolled usage
  autoFocus?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  placeholder = "Search ...",
  initialValue = "",
  autoFocus = false,
  disabled = false,
  accessibilityLabel = "Search",
}: SearchBarProps) {
  const { theme } = useAppTheme();
  const { palette } = theme;

  const isControlled = typeof value === "string";
  const [inner, setInner] = useState(initialValue);

  const text = isControlled ? (value as string) : inner;

  const [isFocused, setIsFocused] = useState(false);

  const borderColor = useMemo(() => {
    if (theme.isDark) return isFocused ? "#FFFFFF" : "#565656";
    return isFocused ? "#000000" : "#8B8B8B";
  }, [isFocused, theme.isDark]);

  const placeholderColor = theme.isDark ? "#565656" : "#8B8B8B";

  const setText = (next: string) => {
    if (!isControlled) setInner(next);
    onChangeText?.(next);
    onSearch?.(next); // ✅ keep compatibility with existing usage
  };

  const handleClear = () => setText("");

  return (
    <View
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor: theme.isDark ? palette.black : palette.white,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      accessibilityRole="search"
      accessibilityLabel={accessibilityLabel}
    >
      <TextInput
        style={[
          styles.input,
          { color: theme.isDark ? palette.white : palette.black },
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={text}
        onChangeText={setText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        cursorColor={palette.yellow}
        selectionColor={`${palette.yellow}50`}
        autoFocus={autoFocus}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never" // iOS native clear off (we use our own)
      />

      {text.length > 0 && !disabled && (
        <Pressable
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
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
