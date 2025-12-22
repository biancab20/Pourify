import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as
  | { ocrProcessDeliveryNoteUrl?: string }
  | undefined;

const OCR_URL = extra?.ocrProcessDeliveryNoteUrl;

if (!OCR_URL) {
  throw new Error("Missing env: EXPO_PUBLIC_OCR_PROCESS_DELIVERY_NOTE_URL");
}

export const API = {
  ocr: {
    processDeliveryNote: OCR_URL,
  },
} as const;
