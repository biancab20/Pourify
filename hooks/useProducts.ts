import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Product,
  GetProductsResponse,
  UpdateProductResponse,
  DeleteProductResponse,
} from "@/types/products";
import type { ApiError } from "@/services/api.errors";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products.api";

/**
 * GET products
 */
export function useProducts(params?: Record<string, string | number>) {
  return useQuery<GetProductsResponse, ApiError>({
    queryKey: ["products", "list", params],
    queryFn: () => getProducts(params),
  });
}

/**
 * CREATE product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, ApiError, { name: string; volume: number; type: string }>(
    {
      mutationKey: ["products", "create"],
      mutationFn: (data) => createProduct(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      },
    }
  );
}

/**
 * UPDATE product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductResponse,
    ApiError,
    { productId: string; data: Partial<Product> }
  >({
    mutationKey: ["products", "update"],
    mutationFn: ({ productId, data }) => updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}

/**
 * DELETE product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<DeleteProductResponse, ApiError, string>({
    mutationKey: ["products", "delete"],
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}
