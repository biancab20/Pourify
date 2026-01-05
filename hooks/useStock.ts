import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GetStocksResponse,
  UpdateStockResponse,
  TransferStockResponse,
  StockItem,
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
    { stockId: number; data: Partial<StockItem> }
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

  return useMutation<TransferStockResponse, ApiError, TransferStockResponse>({
    mutationKey: ["stock", "transfer"],
    mutationFn: transferStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", "list"] });
    },
  });
}
