import { API } from "@/services/api.config";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";
import { guessMimeType } from "@/utils/api-helpers";
import type { Photo, DeliveryOcrResponse } from "@/types/deliveries";
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

  // ✅ backend expects the field name exactly "KEY"
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
    headers: { Accept: "application/json" }, // ✅ don't set Content-Type for FormData
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
    // ✅ single object now
    return normalizeOcrDelivery(raw);
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}
