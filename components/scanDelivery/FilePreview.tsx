import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/shared/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/stores/app-theme-context";
import type { PickedFile } from "../../app/(scan-flow)/scan-new-delivery";

type Props = {
  file: PickedFile;
  onRemove: () => void;
  isBusy: boolean;
};

export default function FilePreview({ file, onRemove, isBusy }: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.previewContainer, { borderTopColor: theme.palette.beige }]}>
      <Text style={[styles.previewTitle, { color: theme.colors.text }]}>Selected file</Text>
      <View style={[styles.fileRow, { backgroundColor: theme.colors.cardBackground }]}>
        <MaterialIcons name="attach-file" size={20} color={theme.colors.icon} />
        <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
          {file.name ?? "File"}
        </Text>
        <Pressable style={[styles.removeButton, { backgroundColor: theme.palette.red, borderColor: theme.colors.background }]} onPress={onRemove} disabled={isBusy}>
          <Text style={styles.removeButtonText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewContainer: { paddingVertical: 16 },
  previewTitle: { fontSize: 16, fontWeight: "500", marginBottom: 12 },
  fileRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, gap: 10 },
  fileName: { flex: 1, fontSize: 14, fontWeight: "500" },
  removeButton: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 2 },
  removeButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
});
