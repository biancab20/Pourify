import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
  },
  plugins: ["expo-secure-store"],
});
