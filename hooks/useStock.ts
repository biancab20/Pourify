import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GetStocksResponse,
  UpdateStockResponse,
  TransferStockResponse,
  StockItem,
  TransferStockRequest,
  CreateStockResponse,
} from "@/types/stock";
import type { ApiError } from "@/services/api.errors";
import { getStocks, updateStock, transferStock, getStockById, createStock } from "@/services/stock.api";

/**
 * GET stock items (OData list)
 */
export function useStocks(params?: Record<string, string | number>) {
  return useQuery<GetStocksResponse, ApiError>({
    queryKey: ["stock", "list", params],
    queryFn: () => getStocks(params),
  });
}

/**
 * GET single stock item (uses dedicated endpoint)
 */
export function useStock(stockId: string) {
  return useQuery<StockItem, ApiError>({
    queryKey: ["stock", "detail", stockId],
    queryFn: () => getStockById(stockId),
    enabled: !!stockId,
  });
}

/**
 * UPDATE stock item
 */
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation<UpdateStockResponse, ApiError, { stockId: string; data: Partial<StockItem> }>({
    mutationKey: ["stock", "update"],
    mutationFn: ({ stockId, data }) => updateStock(stockId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stock", "list"] });
      queryClient.invalidateQueries({ queryKey: ["stock", "detail", variables.stockId] });
    },
  });
}

// In your useStock file, add this hook:
export function useCreateStock() {
  const queryClient = useQueryClient();

  return useMutation<CreateStockResponse, ApiError, {
    storagePlaceId: string;
    productId: string;
    volume: number;
  }>({
    mutationKey: ["stock", "create"],
    mutationFn: createStock,
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

  return useMutation<TransferStockResponse, ApiError, TransferStockRequest>({
    mutationKey: ["stock", "transfer"],
    mutationFn: transferStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", "list"] });
    },
  });

  
}
