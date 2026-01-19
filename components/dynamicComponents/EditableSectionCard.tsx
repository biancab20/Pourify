import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import { Text } from "@/components/shared/Text";
import { Icon } from "@/components/icons/Icon";

type IconName = React.ComponentProps<typeof Icon>["name"];

interface EditableRow {
  id: string;

  // Left side
  title: string;
  leftIconName?: IconName;
  leftIconSize?: number;

  // Main text
  value?: string;
  valueNumberOfLines?: number;
  valueStyle?: TextStyle;

  // Interactions
  onPress?: () => void;
  onEditPress?: () => void;
  showEdit?: boolean;
  editA11yLabel?: string;
}

interface EditableSectionCardProps {
  title?: string;
  rows: EditableRow[];

  style?: ViewStyle | ViewStyle[];
  headerStyle?: TextStyle;
}

export default function EditableSectionCard({
  title,
  rows,
  style,
  headerStyle,
}: EditableSectionCardProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const editIconName: IconName = theme.isDark
    ? "editDarkMode"
    : "editLightMode";

  return (
    <View style={styles.wrapper}>
      {!!title && (
        <Text
          style={[styles.sectionTitle, { color: colors.text }, headerStyle]}
        >
          {title}
        </Text>
      )}

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.cardBackground },
          style,
        ]}
      >
        {rows.map((row, idx) => {
          const hasEdit = row.showEdit ?? typeof row.onEditPress === "function";

          const RowContainer = row.onPress ? Pressable : View;
          const rowContainerProps = row.onPress
            ? {
                onPress: row.onPress,
                accessibilityRole: "button" as const,
                accessibilityLabel: row.title,
              }
            : {};

          return (
            <React.Fragment key={row.id}>
              <RowContainer style={styles.row} {...rowContainerProps}>
                <View style={styles.left}>
                  {/* Title row (icon + title) */}
                  <View style={styles.titleRow}>
                    {!!row.leftIconName && (
                      <View style={styles.leftIconWrap}>
                        <Icon
                          name={row.leftIconName}
                          size={row.leftIconSize ?? 22}
                          color={colors.icon}
                        />
                      </View>
                    )}

                    <Text style={[styles.title, { color: colors.text }]}>
                      {row.title}
                    </Text>
                  </View>

                  {/* Value row (value + edit button on same row) */}
                  <View style={styles.valueRow}>
                    <Text
                      style={[
                        styles.value,
                        { color: colors.text },
                        row.valueStyle,
                      ]}
                      numberOfLines={row.valueNumberOfLines ?? 2}
                      ellipsizeMode="tail"
                    >
                      {row.value ?? ""}
                    </Text>

                    {hasEdit ? (
                      <Pressable
                        onPress={row.onEditPress}
                        disabled={!row.onEditPress}
                        style={styles.editHitBox}
                        accessibilityRole="button"
                        accessibilityLabel={
                          row.editA11yLabel ?? `Edit ${row.title}`
                        }
                      >
                        <Icon name={editIconName} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </RowContainer>

              {idx !== rows.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor:
                        colors.background ?? "rgba(255,255,255,0.08)",
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    paddingTop: 20,
    paddingLeft: 18,
    paddingRight: 8,
  },
  left: {
    flex: 1,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  leftIconWrap: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  editHitBox: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
