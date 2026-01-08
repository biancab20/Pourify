import { View, ScrollView, Image, Pressable, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import type { Photo } from "@/types/deliveries";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  photos: Photo[];
  onRemove: (id: string) => void;
  isBusy: boolean;
};

export default function PhotoPreview({ photos, onRemove, isBusy }: Props) {
  const { theme } = useAppTheme();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handlePhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPhoto(null);
  };

  return (
    <>
      <View style={[styles.previewContainer, { borderTopColor: theme.palette.beige }]}>
        <Text style={[styles.previewTitle, { color: theme.colors.text }]}>Taken Photos ({photos.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.previewItem}>
              <Pressable onPress={() => handlePhotoPress(photo)}>
                <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              </Pressable>
              <Pressable 
                style={[styles.removeButton, { backgroundColor: theme.palette.red, borderColor: theme.colors.background }]} 
                onPress={() => onRemove(photo.id)} 
                disabled={isBusy}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeModal}
        >
          {/* Close button */}
          <Pressable 
            style={styles.closeButton}
            onPress={closeModal}
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>

          {/* Image container - prevent tapping on image from closing modal */}
          <Pressable 
            style={styles.imageContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedPhoto && (
              <Image 
                source={{ uri: selectedPhoto.uri }} 
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </Pressable>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  previewContainer: { 
    paddingVertical: 16 
  },
  previewTitle: { 
    fontSize: 16, 
    fontWeight: "500", 
    marginBottom: 12 
  },
  previewItem: { 
    marginRight: 12, 
    position: "relative", 
    paddingTop: 6 
  },
  previewImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 8 
  },
  removeButton: { 
    position: "absolute", 
    right: -6, 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 2 
  },
  removeButtonText: { 
    color: "#FFFFFF", 
    fontSize: 12, 
    fontWeight: "bold" 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  imageContainer: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
});