import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, GetProductsResponse, UpdateProductResponse, DeleteProductResponse } from "@/types/products";
import type { ApiError } from "@/services/api.errors";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById } from "@/services/products.api";

export function useProducts(params?: Record<string, string | number>) {
  return useQuery<GetProductsResponse, ApiError>({
    queryKey: ["products", "list", params],
    queryFn: () => getProducts(params),
  });
}

export function useProduct(productId: string) {
  return useQuery<Product, ApiError>({
    queryKey: ["products", "detail", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, ApiError, { name: string; volume: number; type: string }>({
    mutationKey: ["products", "create"],
    mutationFn: (data) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<UpdateProductResponse, ApiError, { productId: string; data: Partial<Product> }>({
    mutationKey: ["products", "update"],
    mutationFn: ({ productId, data }) => updateProduct(productId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: ["products", "detail", variables.productId] });
    },
  });
}

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
