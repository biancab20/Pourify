// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      "react-native": require("eslint-plugin-react-native"),
    },
    rules: {
      "react-native/no-unused-styles": "warn",
      "react-native/no-color-literals": "off", // optional, RN rule
      "react-native/no-single-element-style-arrays": "warn", // optional
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
