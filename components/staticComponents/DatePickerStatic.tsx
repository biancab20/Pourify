import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

dayjs.extend(isoWeek);

type Mode = "Day" | "Week" | "Month" | "Year";

export default function DatePicker() {
  const { theme } = useAppTheme();
  const [mode, setMode] = useState<Mode>("Week");
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  const changePeriod = (direction: -1 | 1) => {
    const units: Record<Mode, dayjs.ManipulateType> = {
      Day: "day",
      Week: "week",
      Month: "month",
      Year: "year",
    };
    setCurrentDate(currentDate.add(direction, units[mode]));
  };

  const getLabel = (): string => {
    switch (mode) {
      case "Day":
        return currentDate.format("DD MMM YYYY");
      case "Week":
        return `Week ${currentDate.isoWeek()}`;
      case "Month":
        return currentDate.format("MMMM YYYY");
      case "Year":
        return currentDate.format("YYYY");
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.modeRow,
          { backgroundColor: theme.colors.cardBackground },
        ]}
      >
        {(["Day", "Week", "Month", "Year"] as Mode[]).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setMode(item)}
            style={{ flex: 1 }}
          >
            <Text
              style={[
                styles.modeButton,
                {
                  color: mode === item ? theme.palette.pink : theme.colors.text,
                },
                mode === item && {
                  backgroundColor: theme.palette.pink,
                  color: theme.palette.white,
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={[
          styles.navContainer,
          { backgroundColor: theme.colors.cardBackground },
        ]}
      >
        <TouchableOpacity onPress={() => changePeriod(-1)}>
          <Text style={[styles.arrow, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {getLabel()}
        </Text>

        <TouchableOpacity onPress={() => changePeriod(1)}>
          <Text style={[styles.arrow, { color: theme.colors.text }]}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingBottom: 8,
  },

  modeRow: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
  },

  modeButton: {
    paddingVertical: 4,
    backgroundColor: "transparent",
    textAlign: "center",
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  arrow: {
    fontSize: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
  },
});
