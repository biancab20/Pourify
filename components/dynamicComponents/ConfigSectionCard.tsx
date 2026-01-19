import React from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ListRenderItem,
  ActivityIndicator,
} from "react-native";
import { Text as CustomText } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

interface ConfigSectionCardProps<T> {
  title: string;
  items: T[];
  emptyText: string;
  addLabel: string;
  onAdd: () => void;
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  isLoading?: boolean;
  loadingText?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  disableAddWhenLoading?: boolean;
}

export default function ConfigSectionCard<T>({
  title,
  items,
  emptyText,
  addLabel,
  onAdd,
  keyExtractor,
  renderItem,

  isLoading = false,
  loadingText = "Loading...",

  errorMessage = null,
  onRetry,
  isRetrying = false,

  disableAddWhenLoading = false,
}: ConfigSectionCardProps<T>) {
  const { theme } = useAppTheme();

  const hasError = Boolean(errorMessage);
  const isEmpty = items.length === 0;

  const showAddDisabled =
    (disableAddWhenLoading && isLoading) || (hasError && !onRetry);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>

      <View
        style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}
      >
        {/* Error state */}
        {hasError ? (
          <View style={styles.stateContainer}>
            <Text style={[styles.stateText, { color: theme.colors.text }]}>
              {errorMessage}
            </Text>

            {onRetry ? (
              <Pressable
                onPress={onRetry}
                style={styles.retryButton}
                accessibilityRole="button"
                accessibilityLabel={`Retry loading ${title}`}
              >
                {isRetrying ? (
                  <ActivityIndicator color={theme.colors.icon} />
                ) : (
                  <Text
                    style={[styles.retryText, { color: theme.colors.text }]}
                  >
                    Retry
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>
        ) : isLoading ? (
          /* Loading state */
          <View style={styles.stateContainer}>
            <ActivityIndicator color={theme.colors.icon} />
            <Text style={[styles.stateText, { color: theme.colors.text }]}>
              {loadingText}
            </Text>
          </View>
        ) : isEmpty ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {emptyText}
            </Text>
          </View>
        ) : (
          /* Data state */
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

        <Pressable
          onPress={onAdd}
          style={[styles.addButton, showAddDisabled && { opacity: 0.6 }]}
          disabled={showAddDisabled}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
        >
          <CustomText
            variant="gradient"
            gradientName="paloma"
            style={styles.addLabel}
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

  /** ✅ new */
  stateContainer: {
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 10,
  },
  stateText: {
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 120,
    alignItems: "center",
  },
  retryText: {
    textDecorationLine: "underline",
    fontSize: 16,
  },
});
