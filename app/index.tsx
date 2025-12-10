import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "../stores/app-theme-context";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "@/components/ui/GradientButton";
import { router } from "expo-router";

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Create themed styles
  const themedStyles = {
    input: {
      ...styles.input,
      color: theme.colors.cardText,
    },
    passwordInput: {
      flex: 1,
      marginBottom: 0,
      paddingHorizontal: 14,
      fontSize: 16,
      color: theme.colors.cardText,
    },
    passwordWrapper: {
      ...styles.passwordWrapper,
      borderColor: theme.colors.text || "#E6E6E6",
    },
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.wrapper}>
        {/* Logo */}
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

        {/* Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
            },
          ]}
        >
          {/* Email */}
          <Text style={{ color: theme.colors.cardText }}>E-mail</Text>
          <TextInput
            placeholder="hello@example.com"
            placeholderTextColor="#b6b6b6"
            style={themedStyles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <Text style={[styles.label, { color: theme.colors.cardText }]}>
            Wachtwoord
          </Text>
          <View style={themedStyles.passwordWrapper}>
            <TextInput
              placeholder="•••••••"
              placeholderTextColor="#b6b6b6"
              secureTextEntry={!showPassword}
              style={themedStyles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color={theme.colors.text || "#777"} // Use theme icon color if available
              />
            </TouchableOpacity>
          </View>

          {/* Gradient Button */}
          <GradientButton
            onPress={() => {
              router.replace("/(main-screens)/homepage");
            }}
           //destination="/(main-screens)/homepage"
            buttonText="Login"
          />

          {/* Footer links */}
          <TouchableOpacity>
            <Text
              style={[
                styles.forgotPassword,
                { color: theme.colors.text || "#F54D41" },
              ]}
            >
              Wachtwoord vergeten?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text
              style={[
                styles.createAccount,
                { color: theme.colors.text || "#FF77E0" },
              ]}
            >
              Geen account?{" "}
              <Text style={{ fontWeight: "700" }}>Maak er nu een aan!</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 40,
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 300,
    height: 200,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: -60,
  },
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
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 18,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    height: 48,
    paddingRight: 10,
    marginBottom: 18,
  },
  eyeButton: {
    paddingHorizontal: 4,
  },
  loginButton: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  forgotPassword: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  createAccount: {
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
  },
});
