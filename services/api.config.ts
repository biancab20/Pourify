import Constants from "expo-constants";

const BASE_URL = "https://pourify-api.apps.inholland-minor.openshift.eu/api";

const AUTH_TOKEN_URL =
  "https://pourify-auth.apps.inholland-minor.openshift.eu/realms/pourify/protocol/openid-connect/token";

/**
 * Helper that generates consistent endpoints for standard CRUD resources.
 */
function resource(path: `/${string}`) {
  const base = `${BASE_URL}${path}` as const;

  return {
    base,
    list: base,
    create: base,
    byId: (id: string) => `${base}/${id}` as const,
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

  photo: {
    deliveryNote: `${BASE_URL}/photo/DeliveryNote`,
  },

  // standard CRUD resources
  suppliers: resource("/supplier"),
  products: resource("/product"),
  locations: resource("/bar"),
  stock: resource("/stock"),

  stockTransfer: {
    transfer: `${BASE_URL}/stocks/transfer`,
  },

  deliveries: resource("/delivery"),
} as const;
