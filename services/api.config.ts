import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as
  | { ocrProcessDeliveryNoteUrl?: string }
  | undefined;

const OCR_URL = extra?.ocrProcessDeliveryNoteUrl;
const BASE_URL = "https://pourify-api.apps.inholland-minor.openshift.eu/api";

if (!OCR_URL) {
  throw new Error("Missing env: EXPO_PUBLIC_OCR_PROCESS_DELIVERY_NOTE_URL");
}

export const API = {
  ocr: {
    processDeliveryNote: OCR_URL,
  },
  stock: {
    getStocks: `${BASE_URL}/stock`,
    updateStock: `${BASE_URL}/stock`,
    // Get actua; url from the cloud team later
    transferStock: `${BASE_URL}/stocks/transfer`,
  },
  locations: {
    getBars: `${BASE_URL}/bar`,
    updateBar: `${BASE_URL}/bar`,
    deleteBar: `${BASE_URL}/bar`,
  }
} as const;
