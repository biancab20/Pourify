import { API } from "@/services/api.config";
import type {
  StockItem,
  GetStocksResponse,
  UpdateStockResponse,
  TransferStockResponse,
  TransferStockRequest, // Added
  ApiStocksResponse, // Added
} from "@/types/stock";
import type { ApiError } from "@/services/api.errors";

/**
 * Transform API response to our application format
 */
function transformApiStock(apiStock: any): StockItem {
  return {
    stockId: apiStock.StockId,
    storagePlaceId: apiStock.StoragePlaceId,
    productId: apiStock.ProductId,
    volume: apiStock.Volume,
    lastUpdatedAt: apiStock.LastUpdatedAt || new Date().toISOString(), // Provide default if missing
  };
}

/**
 * GET /stocks
 */
export async function getStocks(
  params?: Record<string, string | number>
): Promise<GetStocksResponse> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

  const res = await fetch(`${API.stock.getStocks}${query}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    // Parse the raw API response
    const apiResponse = JSON.parse(text) as ApiStocksResponse;
    
    // Transform to your application's expected format
    // Note: You mentioned your API returns barId/name/totalVolume,
    // but the example shows different structure. Adjust as needed.
    const transformed: GetStocksResponse = {
      barId: 0, // You'll need to get this from somewhere else
      name: "", // You'll need to get this from somewhere else
      totalVolume: apiResponse.value.reduce((sum, item) => sum + item.Volume, 0),
      items: apiResponse.value.map(transformApiStock),
      totalCount: apiResponse.value.length,
    };
    
    return transformed;
  } catch (error) {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * UPDATE /stocks/:id
 */
export async function updateStock(
  stockId: string, // Changed to string
  payload: Partial<StockItem>
): Promise<UpdateStockResponse> {
  // Transform from camelCase to PascalCase for API
  const apiPayload = {
    StockId: stockId,
    StoragePlaceId: payload.storagePlaceId,
    ProductId: payload.productId,
    Volume: payload.volume,
    LastUpdatedAt: payload.lastUpdatedAt,
  };

  const res = await fetch(`${API.stock.updateStock}/${stockId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(apiPayload),
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const apiResponse = await res.json();
    
    // Transform from PascalCase to camelCase
    return {
      stockId: apiResponse.StockId,
      storagePlaceId: apiResponse.StoragePlaceId,
      productId: apiResponse.ProductId,
      lastUpdatedAt: apiResponse.LastUpdatedAt || new Date().toISOString(),
    };
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * POST /stocks/transfer
 * Note: Changed parameter type from TransferStockResponse to TransferStockRequest
 */
export async function transferStock(
  payload: TransferStockRequest // Changed type
): Promise<TransferStockResponse> {
  // Transform to API format if needed
  const apiPayload = {
    FromStockId: payload.fromStockId,
    ToStockId: payload.toStockId,
    Volume: payload.volume,
  };

  const res = await fetch(API.stock.transferStock, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(apiPayload),
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const apiResponse = await res.json();
    
    // Transform the response if needed
    return {
      fromStock: {
        stockId: apiResponse.fromStock?.StockId || apiResponse.fromStock?.stockId,
        storagePlaceId: apiResponse.fromStock?.StoragePlaceId || apiResponse.fromStock?.storagePlaceId,
        productId: apiResponse.fromStock?.ProductId || apiResponse.fromStock?.productId,
        volume: apiResponse.fromStock?.Volume || apiResponse.fromStock?.volume,
      },
      toStock: {
        stockId: apiResponse.toStock?.StockId || apiResponse.toStock?.stockId,
        storagePlaceId: apiResponse.toStock?.StoragePlaceId || apiResponse.toStock?.storagePlaceId,
        productId: apiResponse.toStock?.ProductId || apiResponse.toStock?.productId,
        volume: apiResponse.toStock?.Volume || apiResponse.toStock?.volume,
      },
      stockLogEntry: {
        stockLogId: apiResponse.stockLogEntry?.StockLogId || apiResponse.stockLogEntry?.stockLogId,
        stockFromId: apiResponse.stockLogEntry?.StockFromId || apiResponse.stockLogEntry?.stockFromId,
        stockToId: apiResponse.stockLogEntry?.StockToId || apiResponse.stockLogEntry?.stockToId,
        modification: apiResponse.stockLogEntry?.Modification || apiResponse.stockLogEntry?.modification,
        volume: apiResponse.stockLogEntry?.Volume || apiResponse.stockLogEntry?.volume,
        logDate: apiResponse.stockLogEntry?.LogDate || apiResponse.stockLogEntry?.logDate,
      },
    };
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}