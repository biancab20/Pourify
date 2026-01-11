import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Text,
} from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Icon } from "@/components/icons/Icon";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

export type FormInputType = "text" | "email" | "number" | "select";

export type SelectOption = { label: string; value: string };

type Anchor = { x: number; y: number; width: number; height: number };

const ITEM_HEIGHT = 40;
const MENU_PADDING = 6;
const GAP_BELOW_BUTTON = 6;

interface FormInputProps {
  value: string;
  onChange: (value: string | number) => void;

  placeholder?: string;

  type?: FormInputType; // ✅ now supports "select"
  options?: SelectOption[]; // ✅ for select

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
  options,

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
  const { palette, colors } = theme;

  const [isFocused, setIsFocused] = useState(false);

  const borderColor = useMemo(() => {
    if (theme.isDark) return isFocused ? palette.white : "#565656";
    return isFocused ? palette.black : "#8B8B8B";
  }, [isFocused, theme.isDark, palette.white, palette.black]);

  const placeholderColor = theme.isDark ? "#565656" : "#8B8B8B";

  // ✅ clear button only makes sense for text/email/number
  const showClear = type !== "select" && value.length > 0 && !disabled;

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
    if (type === "email") return "none";
    return "sentences";
  }, [type]);

  const handleClear = () => onChange("");

  // ----------------------------
  // NUMBER: allow comma decimals
  // ----------------------------
  const handleTextChange = (raw: string) => {
    if (type !== "number") {
      onChange(raw);
      return;
    }

    const text = decimal ? raw.replace(",", ".") : raw;

    const numericRegex = decimal
      ? new RegExp(`^-?\\d*(\\.\\d{0,${maxDecimalDigits}})?$`)
      : /^-?\d*$/;

    if (!numericRegex.test(text)) return;

    // keep as string while typing (prevents "0." collapsing to "0")
    onChange(text);
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (type !== "number") return;

    const normalized = decimal ? value.replace(",", ".").trim() : value.trim();

    if (
      !normalized ||
      normalized === "-" ||
      normalized === "." ||
      normalized === "-."
    ) {
      onChange("");
      return;
    }

    const num = Number(normalized);
    if (!Number.isFinite(num)) {
      onChange("");
      return;
    }

    let clamped = num;
    if (min !== undefined) clamped = Math.max(clamped, min);
    if (max !== undefined) clamped = Math.min(clamped, max);

    if (decimal) {
      const fixed = clamped.toFixed(maxDecimalDigits);
      const pretty = fixed.replace(/\.?0+$/, "");
      onChange(pretty);
    } else {
      onChange(String(Math.trunc(clamped)));
    }
  };

  // ----------------------------
  // SELECT DROPDOWN (Modal + Blur)
  // ----------------------------
  const [showDropdown, setShowDropdown] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const buttonRef = useRef<View>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!showDropdown) return;

    opacity.setValue(0);
    scale.setValue(0.96);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showDropdown, opacity, scale]);

  const selectedLabel = useMemo(() => {
    if (type !== "select") return "";
    const opts = options ?? [];
    return (
      opts.find((o) => o.value === value)?.label ?? placeholder ?? "Select"
    );
  }, [type, options, value, placeholder]);

  const openDropdown = () => {
    if (disabled) return;
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setShowDropdown(true);
      setIsFocused(true);
    });
  };

  const closeDropdown = () => {
    setShowDropdown(false);
    setIsFocused(false);
  };

  const onSelectOption = (v: string) => {
    onChange(v);
    closeDropdown();
  };

  const menuLeft = anchor?.x ?? 0;
  const menuTop = (anchor?.y ?? 0) + (anchor?.height ?? 0) + GAP_BELOW_BUTTON;
  const menuWidth = anchor?.width ?? undefined;

  // ----------------------------
  // RENDER
  // ----------------------------
  const containerA11yLabel =
    accessibilityLabel ??
    (type === "number"
      ? "Number input"
      : type === "select"
      ? "Select input"
      : "Input field");

  return (
    <>
      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor: theme.isDark ? palette.black : palette.white,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        accessibilityRole={type === "select" ? "button" : "text"}
        accessibilityLabel={containerA11yLabel}
      >
        {type === "select" ? (
          <View ref={buttonRef} collapsable={false} style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={showDropdown ? closeDropdown : openDropdown}
              activeOpacity={0.85}
              style={styles.selectButton}
              accessibilityRole="button"
              accessibilityLabel={containerA11yLabel}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.selectText,
                  { color: theme.isDark ? palette.white : palette.black },
                  !value && { color: placeholderColor },
                ]}
                numberOfLines={1}
              >
                {selectedLabel}
              </Text>

              <Ionicons
                name={showDropdown ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.isDark ? palette.white : palette.black}
                style={styles.chevron}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              value={value}
              onChangeText={handleTextChange}
              placeholder={placeholder}
              placeholderTextColor={placeholderColor}
              editable={!disabled}
              autoFocus={autoFocus}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              keyboardType={keyboardType}
              inputMode={inputMode as any}
              autoCapitalize={autoCapitalize}
              autoCorrect={type !== "email"}
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
          </>
        )}
      </View>

      {/* Dropdown modal */}
      {type === "select" ? (
        <Modal visible={showDropdown} transparent animationType="none">
          <TouchableWithoutFeedback onPress={closeDropdown}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View
            style={{
              position: "absolute",
              left: menuLeft,
              top: menuTop,
              width: menuWidth,
            }}
          >
            <Animated.View
              style={[
                styles.menuWrapper,
                { width: menuWidth, opacity, transform: [{ scale }] },
              ]}
            >
              <BlurView
                intensity={35}
                tint={theme.isDark ? "dark" : "light"}
                style={styles.blurCard}
              >
                <View
                  style={[
                    styles.glassBorder,
                    { borderColor: theme.isDark ? "#3A3A3A" : "#D0D0D0" },
                  ]}
                />

                <View style={styles.menuContent}>
                  {(options ?? []).map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.itemRow,
                          isSelected && styles.itemSelectedRow,
                        ]}
                        onPress={() => onSelectOption(opt.value)}
                      >
                        <Text
                          style={[
                            styles.itemText,
                            { color: colors.text },
                            isSelected && styles.itemSelectedText,
                          ]}
                        >
                          {opt.label}
                        </Text>

                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={colors.text}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </BlurView>
            </Animated.View>
          </View>
        </Modal>
      ) : null}
    </>
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

  // Select
  selectButton: {
    height: 52,
    paddingLeft: 20,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 18,
    flexShrink: 1,
    paddingRight: 10,
  },
  chevron: { marginLeft: 8 },

  // Dropdown menu
  menuWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  blurCard: { borderRadius: 18, overflow: "hidden" },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 18,
    opacity: 0.7,
  },
  menuContent: { padding: MENU_PADDING },

  itemRow: {
    height: ITEM_HEIGHT,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemSelectedRow: { backgroundColor: "rgba(255,255,255,0.08)" },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    flexShrink: 1,
    paddingRight: 10,
  },
  itemSelectedText: { fontWeight: "700" },
});
