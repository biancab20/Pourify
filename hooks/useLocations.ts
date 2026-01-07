import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bar, GetBarsResponse, UpdateBarResponse, DeleteBarResponse } from "@/types/locations";
import type { ApiError } from "@/services/api.errors";
import { getBars, updateBar, deleteBar, createBar, getBarById } from "@/services/locations.api";

export function useBars(params?: Record<string, string | number>) {
  return useQuery<GetBarsResponse, ApiError>({
    queryKey: ["locations", "bars", params],
    queryFn: () => getBars(params),
  });
}

export function useBar(barId: string) {
  return useQuery<Bar, ApiError>({
    queryKey: ["locations", "bar", barId],
    queryFn: () => getBarById(barId),
    enabled: !!barId,
  });
}

export function useCreateBar() {
  const queryClient = useQueryClient();

  return useMutation<Bar, ApiError, { name: string }>({
    mutationKey: ["locations", "createBar"],
    mutationFn: ({ name }) => createBar({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", "bars"] });
    },
  });
}

export function useUpdateBar() {
  const queryClient = useQueryClient();

  return useMutation<UpdateBarResponse, ApiError, { barId: string; data: Partial<Bar> }>({
    mutationKey: ["locations", "updateBar"],
    mutationFn: ({ barId, data }) => updateBar(barId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", "bars"] });
      queryClient.invalidateQueries({ queryKey: ["locations", "bar"] });
    },
  });
}

export function useDeleteBar() {
  const queryClient = useQueryClient();

  return useMutation<DeleteBarResponse, ApiError, string>({
    mutationKey: ["locations", "deleteBar"],
    mutationFn: deleteBar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", "bars"] });
    },
  });
}
