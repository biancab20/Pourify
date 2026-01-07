import { API } from "@/services/api.config";
import type {
  StockItem,
  StockItemDto,
  GetStocksResponse,
  UpdateStockResponse,
  TransferStockResponse,
  TransferStockRequest,
  CreateStockResponse,
} from "@/types/stock";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";
import { parseODataList, toApiError, firstOrThrow } from "@/utils/odata";
import { mapStockDto } from "@/utils/api-mappers";
import type { ODataEntity } from "@/types/odata";

export async function getStocks(params?: Record<string, string | number>): Promise<GetStocksResponse> {
  const query = params
    ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : "";

  const res = await authedFetch(`${API.stock.list}${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const data = parseODataList<StockItemDto>(text);
    return {
      "@odata.context": data["@odata.context"],
      value: data.value.map(mapStockDto),
    };
  } catch {
    throw { message: "Failed to parse JSON response", status: res.status, body: text } satisfies ApiError;
  }
}

export async function getStockById(stockId: string): Promise<StockItem> {
  const res = await authedFetch(API.stock.byId(stockId), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const list = parseODataList<StockItemDto>(text);
  return mapStockDto(firstOrThrow(list, "Stock"));
}

export async function createStock(payload: {
  storagePlaceId: string;
  productId: string;
  volume: number;
}): Promise<CreateStockResponse> {
  const res = await authedFetch(API.stock.create, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      StoragePlaceId: payload.storagePlaceId,
      ProductId: payload.productId,
      Volume: payload.volume,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataEntity<StockItemDto>;
  return mapStockDto(data);
}

export async function updateStock(stockId: string, payload: Partial<StockItem>): Promise<UpdateStockResponse> {
  const res = await authedFetch(API.stock.update(stockId), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      StockId: stockId,
      StoragePlaceId: payload.storagePlaceId,
      ProductId: payload.productId,
      Volume: payload.volume,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataEntity<StockItemDto>;
  return mapStockDto(data);
}

export async function transferStock(payload: TransferStockRequest): Promise<TransferStockResponse> {
  const res = await authedFetch(API.stockTransfer.transfer, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      FromStockId: payload.fromStockId,
      ToStockId: payload.toStockId,
      Volume: payload.volume,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  // keep tolerant parsing until you paste the exact transfer response again
  try {
    const apiResponse = JSON.parse(text);

    return {
      fromStock: {
        stockId: apiResponse.fromStock?.StockId ?? apiResponse.fromStock?.stockId,
        storagePlaceId: apiResponse.fromStock?.StoragePlaceId ?? apiResponse.fromStock?.storagePlaceId,
        productId: apiResponse.fromStock?.ProductId ?? apiResponse.fromStock?.productId,
        volume: apiResponse.fromStock?.Volume ?? apiResponse.fromStock?.volume,
      },
      toStock: {
        stockId: apiResponse.toStock?.StockId ?? apiResponse.toStock?.stockId,
        storagePlaceId: apiResponse.toStock?.StoragePlaceId ?? apiResponse.toStock?.storagePlaceId,
        productId: apiResponse.toStock?.ProductId ?? apiResponse.toStock?.productId,
        volume: apiResponse.toStock?.Volume ?? apiResponse.toStock?.volume,
      },
      stockLogEntry: {
        stockLogId: apiResponse.stockLogEntry?.StockLogId ?? apiResponse.stockLogEntry?.stockLogId,
        stockFromId: apiResponse.stockLogEntry?.StockFromId ?? apiResponse.stockLogEntry?.stockFromId,
        stockToId: apiResponse.stockLogEntry?.StockToId ?? apiResponse.stockLogEntry?.stockToId,
        modification: apiResponse.stockLogEntry?.Modification ?? apiResponse.stockLogEntry?.modification,
        volume: apiResponse.stockLogEntry?.Volume ?? apiResponse.stockLogEntry?.volume,
        logDate: apiResponse.stockLogEntry?.LogDate ?? apiResponse.stockLogEntry?.logDate,
      },
    };
  } catch {
    throw { message: "Failed to parse JSON response", status: res.status, body: text } satisfies ApiError;
  }
}
