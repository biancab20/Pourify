import { View, ScrollView, Image, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import type { Photo } from "@/types/deliveries";

type Props = {
  photos: Photo[];
  onRemove: (id: string) => void;
  isBusy: boolean;
};

export default function PhotoPreview({ photos, onRemove, isBusy }: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.previewContainer, { borderTopColor: theme.palette.beige }]}>
      <Text style={[styles.previewTitle, { color: theme.colors.text }]}>Taken Photos ({photos.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {photos.map((photo) => (
          <View key={photo.id} style={styles.previewItem}>
            <Image source={{ uri: photo.uri }} style={styles.previewImage} />
            <Pressable style={[styles.removeButton, { backgroundColor: theme.palette.red, borderColor: theme.colors.background }]} onPress={() => onRemove(photo.id)} disabled={isBusy}>
              <Text style={styles.removeButtonText}>✕</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  previewContainer: { paddingVertical: 16 },
  previewTitle: { fontSize: 16, fontWeight: "500", marginBottom: 12 },
  previewItem: { marginRight: 12, position: "relative", paddingTop: 6 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeButton: { position: "absolute", right: -6, width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 2 },
  removeButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
});
