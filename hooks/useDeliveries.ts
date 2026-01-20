import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DeliveryOcrResponse,
  DeliveryDto,
  CreateDeliveryDto,
  GetDeliveriesResponse,
  Delivery,
} from "@/types/deliveries";
import type { ApiError } from "@/services/api.errors";
import {
  processDeliveryNote,
  type ProcessDeliveryNoteInput,
  createDelivery,
  getDeliveries,
  getDeliveryById,
  deleteDelivery,
} from "@/services/deliveries.api";

// Hook to process delivery note via OCR
export function useProcessDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation<DeliveryOcrResponse, ApiError, ProcessDeliveryNoteInput>({
    mutationKey: ["deliveries", "processDeliveryNote"],
    mutationFn: processDeliveryNote,
    retry: 0,
    onSuccess: (data) => {
      queryClient.setQueryData(["deliveries", "latest"], (old: any) => {
        const oldSupplierId = old?.supplier?.supplierId;

        const shouldKeepOldSupplierId =
          typeof oldSupplierId === "string" &&
          oldSupplierId !== "00000000-0000-0000-0000-000000000000";

        return {
          ...data,
          supplier: {
            ...data.supplier,
            supplierId: shouldKeepOldSupplierId
              ? oldSupplierId
              : data.supplier?.supplierId,
          },
        };
      });
      queryClient.setQueryData(["deliveries", "removedIds"], []);
      queryClient.setQueryData(["deliveries", "status"], {});
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
      queryClient.invalidateQueries({ queryKey: ["deliveries", "list"] });
      queryClient.removeQueries({ queryKey: ["deliveries", "latest"] });
      queryClient.invalidateQueries({ queryKey: ["stock", "list"] });
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
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
