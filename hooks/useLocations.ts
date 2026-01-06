// useLocations.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Bar,
  GetBarsResponse,
  UpdateBarResponse,
  DeleteBarResponse,
} from "@/types/locations";
import type { ApiError } from "@/services/api.errors";
import { getBars, updateBar, deleteBar, createBar } from "@/services/locations.api";

/**
 * GET bars (locations)
 */
export function useBars(params?: Record<string, string | number>) {
  return useQuery<GetBarsResponse, ApiError>({
    queryKey: ["locations", "bars", params],
    queryFn: () => getBars(params),
  });
}

/**
 * CREATE bar
 */
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

/**
 * UPDATE bar
 */
export function useUpdateBar() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateBarResponse,
    ApiError,
    { barId: string; data: Partial<Bar> }  // Changed barId from number to string
  >({
    mutationKey: ["locations", "updateBar"],
    mutationFn: ({ barId, data }) => updateBar(barId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", "bars"] });
    },
  });
}

/**
 * DELETE bar
 */
export function useDeleteBar() {
  const queryClient = useQueryClient();

  return useMutation<DeleteBarResponse, ApiError, string>({  // Changed from number to string
    mutationKey: ["locations", "deleteBar"],
    mutationFn: deleteBar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", "bars"] });
    },
  });
}