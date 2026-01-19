import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "@/components/shared/GradientButton";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const status = useAuthStore((s) => s.status);
  const signIn = useAuthStore((s) => s.signIn);

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    if (status === "signedIn") {
      router.replace("/(main-screens)/homepage");
    }
  }, [status]);

  const placeholderColor = theme.isDark ? "#565656" : "#8B8B8B";

  const getBorderColor = useCallback(
    (focused: boolean) => {
      if (theme.isDark) return focused ? "#FFFFFF" : "#565656";
      return focused ? "#000000" : "#8B8B8B";
    },
    [theme.isDark],
  );

  const usernameBorderColor = useMemo(
    () => getBorderColor(isEmailFocused),
    [getBorderColor, isEmailFocused],
  );
  const passwordBorderColor = useMemo(
    () => getBorderColor(isPasswordFocused),
    [getBorderColor, isPasswordFocused],
  );

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password) {
      Alert.alert("Missing info", "Please enter username and password.");
      return;
    }

    try {
      setLoading(true);
      await signIn({ username: username.trim(), password });
      router.replace("/(main-screens)/homepage");
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [username, password, signIn]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.wrapper}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Every. Drop. Counts.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <Text style={[styles.label, { color: theme.colors.cardText }]}>
            Username
          </Text>
          <TextInput
            placeholder="Username"
            placeholderTextColor={placeholderColor}
            style={[
              styles.input,
              {
                color: theme.colors.cardText,
                borderColor: usernameBorderColor,
              },
            ]}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
          />

          <Text style={[styles.label, { color: theme.colors.cardText }]}>
            Password
          </Text>

          <View
            style={[
              styles.passwordWrapper,
              { borderColor: passwordBorderColor },
            ]}
          >
            <TextInput
              placeholder="Password"
              placeholderTextColor={placeholderColor}
              secureTextEntry={!showPassword}
              style={[styles.passwordInput, { color: theme.colors.cardText }]}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />

            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color={theme.colors.text || "#777"}
              />
            </TouchableOpacity>
          </View>

          <GradientButton
            onPress={handleLogin}
            text={loading ? "Logging in..." : "Login"}
            disabled={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  wrapper: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 40,
    width: "100%",
    alignItems: "center",
  },
  logoContainer: { alignItems: "center", marginBottom: 40 },
  logo: { width: 300, height: 200 },
  subtitle: { fontSize: 14, fontWeight: "700", marginTop: -60 },
  card: {
    width: "88%",
    borderRadius: 22,
    paddingVertical: 30,
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 18,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingRight: 10,
    marginBottom: 18,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    includeFontPadding: false,
  },
  eyeButton: { paddingHorizontal: 4 },
});
