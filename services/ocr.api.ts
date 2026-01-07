import { API } from "@/services/api.config";
import type { Photo, DeliveryOcrResponse } from "@/types/deliveries";
import type { ApiError } from "@/services/api.errors";
import { guessMimeType } from "@/utils/mime";
import { normalizeOcrDelivery } from "@/utils/api-mappers";

export type PickedFileInput = { uri: string; name?: string; mimeType?: string };
export type ProcessDeliveryNoteInput =
  | { kind: "photos"; photos: Photo[] }
  | { kind: "file"; file: PickedFileInput };

export async function processDeliveryNote(
  input: ProcessDeliveryNoteInput
): Promise<DeliveryOcrResponse> {
  const form = new FormData();

  if (input.kind === "photos") {
    input.photos.forEach((p, index) => {
      form.append("files", {
        uri: p.uri,
        name: `delivery-note-${index + 1}.jpg`,
        type: "image/jpeg",
      } as any);
    });
  } else {
    const name = input.file.name ?? "delivery-note";
    form.append("files", {
      uri: input.file.uri,
      name,
      type: guessMimeType(name, input.file.mimeType),
    } as any);
  }

  const res = await fetch(API.ocr.processDeliveryNote, {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  if (!contentType.includes("application/json")) {
    const err: ApiError = {
      message: "Unexpected response type",
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const raw = JSON.parse(text);
    // OCR returns an array
    const normalized = Array.isArray(raw) ? raw.map(normalizeOcrDelivery) : [];
    return normalized as DeliveryOcrResponse;
  } catch {
    const err: ApiError = {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    };
    throw err;
  }
}
