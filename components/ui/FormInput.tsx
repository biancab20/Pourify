import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
} from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Icon } from "@/components/icons/Icon";

export type FormInputType = "text" | "email" | "number" | "select"; // select for later

export interface FormInputProps {
  value: string;
  onChange: (value: string | number) => void;

  placeholder?: string;

  type?: Exclude<FormInputType, "select">; // select later
  min?: number;
  max?: number;
  decimal?: boolean;
  maxDecimalDigits?: number;

  /** optional extras */
  disabled?: boolean;
  autoFocus?: boolean;
  accessibilityLabel?: string;

  /** allows passing extra RN TextInput props safely */
  inputProps?: Omit<
    TextInputProps,
    "value" | "onChangeText" | "editable" | "placeholder"
  >;
}

export default function FormInput({
  value,
  onChange,
  placeholder = "",
  type = "text",
  min,
  max,
  decimal = false,
  maxDecimalDigits = 2,
  disabled = false,
  autoFocus = false,
  accessibilityLabel,
  inputProps,
}: FormInputProps) {
  const { theme } = useAppTheme();
  const { palette } = theme;

  const [isFocused, setIsFocused] = useState(false);

  const borderColor = useMemo(() => {
    if (theme.isDark) return isFocused ? palette.white : "#565656";
    return isFocused ? palette.black : "#8B8B8B";
  }, [isFocused, theme.isDark, palette.white, palette.black]);

  const placeholderColor = theme.isDark ? "#565656" : "#8B8B8B";

  // ✅ always allow clear for this component (since no password type)
  const showClear = value.length > 0 && !disabled;

  const keyboardType = useMemo(() => {
    if (type === "email") return "email-address";
    if (type === "number") return decimal ? "decimal-pad" : "number-pad";
    return "default";
  }, [type, decimal]);

  const inputMode = useMemo(() => {
    if (type === "email") return "email";
    if (type === "number") return decimal ? "decimal" : "numeric";
    return "text";
  }, [type, decimal]);

  const autoCapitalize = useMemo(() => {
    // email should never capitalize
    if (type === "email") return "none";
    return "sentences";
  }, [type]);

  const handleClear = () => onChange("");

  const handleTextChange = (text: string) => {
    if (type !== "number") {
      onChange(text);
      return;
    }

    // NUMBER MODE
    const numericRegex = decimal
      ? new RegExp(`^-?\\d*\\.?\\d{0,${maxDecimalDigits}}$`)
      : /^-?\d*$/;

    if (text === "" || numericRegex.test(text)) {
      if (text && text !== "-" && text !== ".") {
        const numValue = parseFloat(text);

        if (min !== undefined && numValue < min) {
          const limited = String(min);
          onChange(decimal ? parseFloat(limited) : parseInt(limited, 10));
          return;
        }

        if (max !== undefined && numValue > max) {
          const limited = String(max);
          onChange(decimal ? parseFloat(limited) : parseInt(limited, 10));
          return;
        }
      }

      if (text === "" || text === "-" || text === ".") {
        onChange("");
      } else {
        onChange(decimal ? parseFloat(text) : parseInt(text, 10));
      }
    }
  };

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
      accessibilityRole="text"
      accessibilityLabel={
        accessibilityLabel ??
        (type === "number" ? "Number input" : "Input field")
      }
    >
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        editable={!disabled}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        inputMode={inputMode as any}
        autoCapitalize={autoCapitalize}
        autoCorrect={type !== "email"} // optional: keep email clean
        cursorColor={palette.yellow}
        selectionColor={`${palette.yellow}50`}
        style={[
          styles.input,
          { color: theme.isDark ? palette.white : palette.black },
        ]}
        {...inputProps}
      />

      {showClear && (
        <Pressable
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear input"
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
    borderRadius: 22,
    borderWidth: 0.5,
    width: "100%",
    alignSelf: "center",
    maxHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 17,
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
