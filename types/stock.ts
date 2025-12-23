import type { PaginatedResponse } from "@/types/api";

export type StockItem = {
  stockId: number;
  storagePlaceId: number;
  productId: number;
  volume: number;
  lastUpdatedAt: string;
};

// Your getStocks response includes barId/name/totalVolume and then items/totalCount
export type GetStocksResponse = {
  barId: number;
  name: string;
  totalVolume: number;
} & PaginatedResponse<StockItem>;

export type UpdateStockResponse = {
  stockId: number;
  storagePlaceId: number;
  productId: number;
  lastUpdatedAt: string;
};

export type StockTransferStock = {
  stockId: number;
  storagePlaceId: number;
  productId: number;
  volume: number;
};

export type StockLogEntry = {
  stockLogId: number;
  stockFromId: number;
  stockToId: number;
  modification: number;
  volume: number;
  logDate: string;
};

export type TransferStockResponse = {
  fromStock: StockTransferStock;
  toStock: StockTransferStock;
  stockLogEntry: StockLogEntry;
};
