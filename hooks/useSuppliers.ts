import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Supplier,
  GetSuppliersResponse,
  CreateSupplierResponse,
  UpdateSupplierResponse,
  DeleteSupplierResponse,
} from "@/types/suppliers";
import type { ApiError } from "@/services/api.errors";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/suppliers.api";

/**
 * GET suppliers
 */
export function useSuppliers(params?: Record<string, string | number>) {
  return useQuery<GetSuppliersResponse, ApiError>({
    queryKey: ["suppliers", "list", params],
    queryFn: () => getSuppliers(params),
  });
}

/**
 * CREATE supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation<CreateSupplierResponse, ApiError, { name: string; email: string }>({
    mutationKey: ["suppliers", "create"],
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
    },
  });
}

/**
 * UPDATE supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSupplierResponse,
    ApiError,
    { supplierId: string; data: Partial<Pick<Supplier, "name" | "email">> }
  >({
    mutationKey: ["suppliers", "update"],
    mutationFn: ({ supplierId, data }) => updateSupplier(supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
    },
  });
}

/**
 * DELETE supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation<DeleteSupplierResponse, ApiError, string>({
    mutationKey: ["suppliers", "delete"],
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
    },
  });
}
