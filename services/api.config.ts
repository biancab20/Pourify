import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as
  | { ocrProcessDeliveryNoteUrl?: string }
  | undefined;

const OCR_URL = extra?.ocrProcessDeliveryNoteUrl;
const BASE_URL = "https://pourify-api.apps.inholland-minor.openshift.eu/api";

const AUTH_TOKEN_URL =
  "https://pourify-auth.apps.inholland-minor.openshift.eu/realms/pourify/protocol/openid-connect/token";

if (!OCR_URL) {
  throw new Error("Missing env: EXPO_PUBLIC_OCR_PROCESS_DELIVERY_NOTE_URL");
}

/**
 * Helper that generates consistent endpoints for standard CRUD resources.
 * Example:
 *   const suppliers = resource("/supplier")
 *   suppliers.list      -> ".../supplier"
 *   suppliers.create    -> ".../supplier"
 *   suppliers.byId(id)  -> ".../supplier/{id}"
 */
function resource(path: `/${string}`) {
  const base = `${BASE_URL}${path}` as const;

  return {
    base,
    list: base,
    create: base,
    byId: (id: string) => `${base}/${id}` as const,

    // optional aliases (use if you like clarity)
    update: (id: string) => `${base}/${id}` as const,
    delete: (id: string) => `${base}/${id}` as const,
  } as const;
}

export const API = {
  baseUrl: BASE_URL,

  auth: {
    token: AUTH_TOKEN_URL,
    clientId: "app",
  },

  // separate domain/service
  ocr: {
    processDeliveryNote: OCR_URL,
  },

  // standard CRUD resources
  suppliers: resource("/supplier"),
  products: resource("/product"),
  locations: resource("/bar"),
  stock: resource("/stock"),

  // special-case endpoint that doesn't fit CRUD on /stock
  stockTransfer: {
    transfer: `${BASE_URL}/stocks/transfer`,
  },

  // deliveries (you have GET /delivery; keep this ready)
  deliveries: resource("/delivery"),
} as const;