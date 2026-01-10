// hooks/useDeliveries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { 
  DeliveryOcrResponse, 
  DeliveryDto,
  CreateDeliveryDto,
  GetDeliveriesResponse,
  Delivery 
} from "@/types/deliveries";
import type { ApiError } from "@/services/api.errors";
import { 
  processDeliveryNote, 
  type ProcessDeliveryNoteInput,
  createDelivery,
  getDeliveries,
  getDeliveryById,
  deleteDelivery 
} from "@/services/deliveries.api";

// Hook to process delivery note via OCR
export function useProcessDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation<DeliveryOcrResponse, ApiError, ProcessDeliveryNoteInput>({
    mutationKey: ["deliveries", "processDeliveryNote"],
    mutationFn: processDeliveryNote,
    retry: 0,
    onSuccess: (data) => {
      // Store the OCR result in cache for use in DeliverySummary
      queryClient.setQueryData(["deliveries", "latest"], data);
    },
  });
}

// Hook to get all deliveries
export function useDeliveries(params?: Record<string, string | number>) {
  return useQuery<GetDeliveriesResponse, ApiError>({
    queryKey: ["deliveries", "list", params],
    queryFn: () => getDeliveries(params),
  });
}

// Hook to create a new delivery
export function useCreateDelivery() {
  const queryClient = useQueryClient();

  return useMutation<DeliveryDto, ApiError, CreateDeliveryDto>({
    mutationKey: ["deliveries", "create"],
    mutationFn: createDelivery,
    onSuccess: () => {
      // Invalidate deliveries queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["deliveries", "list"] });
      // Also clear the OCR cache
      queryClient.removeQueries({ queryKey: ["deliveries", "latest"] });
    },
  });
}

// Hook to get a specific delivery by ID
export function useDelivery(deliveryId: string) {
  return useQuery<Delivery, ApiError>({
    queryKey: ["deliveries", "detail", deliveryId],
    queryFn: () => getDeliveryById(deliveryId),
    enabled: !!deliveryId,
  });
}

// Hook to delete a delivery
export function useDeleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation<{ value: boolean }, ApiError, string>({
    mutationKey: ["deliveries", "delete"],
    mutationFn: deleteDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries", "list"] });
    },
  });
}