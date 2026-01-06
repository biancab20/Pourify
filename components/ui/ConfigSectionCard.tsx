import React from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ListRenderItem,
} from "react-native";
import { Text as CustomText}  from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

interface ConfigSectionCardProps<T> {
  title: string;
  items: T[];
  emptyText: string;

  addLabel: string;
  onAdd: () => void;

  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
}

export default function ConfigSectionCard<T>({
  title,
  items,
  emptyText,
  addLabel,
  onAdd,
  keyExtractor,
  renderItem,
}: ConfigSectionCardProps<T>) {
  const { theme } = useAppTheme();
  const isEmpty = items.length === 0;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>

      <View
        style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {emptyText}
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: theme.colors.background },
                ]}
              />
            )}
          />
        )}

        <View
          style={[
            styles.separator,
            { backgroundColor: theme.colors.background },
          ]}
        />

        <Pressable onPress={onAdd} style={styles.addButton}>
          <CustomText
            variant="gradient"
            gradientName="paloma"
            style={styles.addLabel}
            accessibilityRole="button"
          >
            {addLabel}
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  addButton: {
    paddingVertical: 18,
    alignItems: "center",
  },
  addLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
