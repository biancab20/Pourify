import { useMutation } from "@tanstack/react-query";
import type { DeliveryOcrResponse } from "@/types/deliveries";
import type { ApiError } from "@/services/api.errors";
import { processDeliveryNote, type ProcessDeliveryNoteInput } from "@/services/deliveries.api";

export function useProcessDeliveryNote() {
  return useMutation<DeliveryOcrResponse, ApiError, ProcessDeliveryNoteInput>({
    mutationKey: ["deliveries", "processDeliveryNote"],
    mutationFn: processDeliveryNote,
    retry: 0,
  });
}
