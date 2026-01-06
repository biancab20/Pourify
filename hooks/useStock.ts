import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GetStocksResponse,
  UpdateStockResponse,
  TransferStockResponse,
  StockItem,
  TransferStockRequest, // Added
} from "@/types/stock";
import type { ApiError } from "@/services/api.errors";
import {
  getStocks,
  updateStock,
  transferStock,
} from "@/services/stock.api";

/**
 * GET stock items
 */
export function useStocks(params?: Record<string, string | number>) {
  return useQuery<GetStocksResponse, ApiError>({
    queryKey: ["stock", "list", params],
    queryFn: () => getStocks(params),
  });
}

/**
 * UPDATE stock item
 */
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateStockResponse,
    ApiError,
    { stockId: string; data: Partial<StockItem> } // Changed stockId to string
  >({
    mutationKey: ["stock", "update"],
    mutationFn: ({ stockId, data }) => updateStock(stockId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", "list"] });
    },
  });
}

/**
 * TRANSFER stock
 */
export function useTransferStock() {
  const queryClient = useQueryClient();

  // Changed from TransferStockResponse to TransferStockRequest
  return useMutation<TransferStockResponse, ApiError, TransferStockRequest>({
    mutationKey: ["stock", "transfer"],
    mutationFn: transferStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", "list"] });
    },
  });
}

// Optional: Add a hook to get a single stock item
export function useStock(stockId: string) {
  return useQuery<StockItem, ApiError>({
    queryKey: ["stock", "detail", stockId],
    queryFn: async () => {
      const response = await getStocks();
      const stock = response.items.find(item => item.stockId === stockId);
      if (!stock) {
        throw new Error(`Stock with ID ${stockId} not found`);
      }
      return stock;
    },
    enabled: !!stockId, // Only run if stockId is provided
  });
}