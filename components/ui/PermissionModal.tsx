import React from "react";
import { View, StyleSheet, Pressable, Modal } from "react-native";
import { Text } from "@/components/shared/Text";
import { AppTheme } from "@/stores/app-theme-context";

interface PermissionModalProps {
  visible: boolean;
  onAllow: () => void;
  onDontAllow: () => void;
  theme: AppTheme;
}

export default function PermissionModal({ 
  visible, 
  onAllow, 
  onDontAllow, 
  theme 
}: PermissionModalProps) {
  const borderColor = theme.isDark ? "#333333" : "#E5E5EA";
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDontAllow}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { 
          backgroundColor: theme.colors.cardBackground,
        }]}>
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.cardText }]}>
              &quot;Pourify&quot; Would Like to Access the Camera
            </Text>
          </View>
          
          {/* Body */}
          <View style={styles.modalBody}>
            <Text style={[styles.modalText, { color: theme.colors.cardText }]}>
              We need your camera to scan delivery notes
            </Text>
          </View>
          
          {/* Buttons - Side by Side */}
          <View style={[styles.buttonsContainer, { borderTopColor: borderColor }]}>
            <Pressable 
              style={styles.button}
              onPress={onDontAllow}
            >
              <Text style={[styles.buttonText, { color: theme.colors.cardText }]}>
                Don&apos;t Allow
              </Text>
            </Pressable>
            
            <View style={[styles.buttonDivider, { backgroundColor: borderColor }]} />
            
            <Pressable 
              style={styles.button}
              onPress={onAllow}
            >
              <Text style={[styles.buttonText, { color: theme.colors.cardText }]}>
                Allow
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "80%",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    paddingTop: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  modalBody: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  modalText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    borderTopWidth: 0.5,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDivider: {
    width: 0.5,
    height: "100%",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "400",
  },
});