import { API } from "@/services/api.config";
import type {
  StockItem,
  GetStocksResponse,
  UpdateStockResponse,
  TransferStockResponse,
} from "@/types/stock";
import type { ApiError } from "@/services/api.errors";

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
    return JSON.parse(text) as GetStocksResponse;
  } catch {
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
  stockId: number,
  payload: Partial<StockItem>
): Promise<UpdateStockResponse> {
  const res = await fetch(`${API.stock.updateStock}/${stockId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
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
    return JSON.parse(text) as UpdateStockResponse;
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
 */
export async function transferStock(
  payload: TransferStockResponse
): Promise<TransferStockResponse> {
  const res = await fetch(API.stock.transferStock, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
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
    return JSON.parse(text) as TransferStockResponse;
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}
