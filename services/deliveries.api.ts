// services/deliveries.api.ts
import { API } from "@/services/api.config";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";
import { guessMimeType } from "@/utils/api-helpers";
import type { 
  Photo, 
  DeliveryOcrResponse,
  DeliveryDto,
  CreateDeliveryDto,
  GetDeliveriesResponse,
  Delivery 
} from "@/types/deliveries";
import { normalizeOcrDelivery } from "@/utils/api-mappers";

export type PickedFileInput = { uri: string; name?: string; mimeType?: string };
export type ProcessDeliveryNoteInput =
  | { kind: "photos"; photos: Photo[] }
  | { kind: "file"; file: PickedFileInput };

function toApiError(res: Response, bodyText: string): ApiError {
  return {
    message: `Request failed with status ${res.status}`,
    status: res.status,
    body: bodyText,
  };
}

/**
 * POST /photo/DeliveryNote
 * multipart/form-data with field name "KEY"
 * Response: Delivery-like object (NOT OData)
 */
export async function processDeliveryNote(
  input: ProcessDeliveryNoteInput
): Promise<DeliveryOcrResponse> {
  const form = new FormData();

  const fieldName = "KEY";

  if (input.kind === "photos") {
    input.photos.forEach((p, index) => {
      form.append(fieldName, {
        uri: p.uri,
        name: `delivery-note-${index + 1}.jpg`,
        type: "image/jpeg",
      } as any);
    });
  } else {
    const name = input.file.name ?? "delivery-note";
    form.append(fieldName, {
      uri: input.file.uri,
      name,
      type: guessMimeType(name, input.file.mimeType),
    } as any);
  }

  const res = await authedFetch(API.photo.deliveryNote, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form as any,
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw {
      message: "Unexpected response type",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }

  try {
    const raw = JSON.parse(text);
    return normalizeOcrDelivery(raw);
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * POST /delivery
 * Create a new delivery in the database
 */
export async function createDelivery(
  data: CreateDeliveryDto
): Promise<DeliveryDto> {
  const res = await authedFetch(API.deliveries.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    throw toApiError(res, text);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * GET /delivery?$expand=products,supplier
 * Get all deliveries with optional query parameters
 */
export async function getDeliveries(
  params?: Record<string, string | number>
): Promise<GetDeliveriesResponse> {
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
    
  const res = await authedFetch(`${API.deliveries.list}${queryString}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    return JSON.parse(text);
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * GET /delivery/{id}?$expand=products,supplier
 * Get a specific delivery by ID
 */
export async function getDeliveryById(deliveryId: string): Promise<Delivery> {
  const res = await authedFetch(`${API.deliveries.byId(deliveryId)}?$expand=products,supplier`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const dto = JSON.parse(text);
    return dto;
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * DELETE /delivery/{id}
 * Delete a delivery by ID
 */
export async function deleteDelivery(deliveryId: string): Promise<{ value: boolean }> {
  const res = await authedFetch(API.deliveries.delete(deliveryId), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    return JSON.parse(text);
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}