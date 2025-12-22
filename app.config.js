import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    ocrProcessDeliveryNoteUrl: process.env.EXPO_PUBLIC_OCR_PROCESS_DELIVERY_NOTE_URL,
  },
});
