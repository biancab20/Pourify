import type { ODataList } from "@/types/odata";

export type StockItem = {
  stockId: string; 
  storagePlaceId: string; 
  productId: string; 
  volume: number;
};

export type StockItemDto = {
  StockId: string;
  StoragePlaceId: string;
  ProductId: string;
  Volume: number;
};

export type GetStocksResponse = ODataList<StockItem>;
export type GetStockByIdResponse = StockItem;
export type CreateStockResponse = StockItem;
export type UpdateStockResponse = StockItem;

/** Transfer */
export type TransferStockRequest = {
  fromStockId: string;
  toStockId: string;
  volume: number;
};

export type StockTransferStock = {
  stockId: string;
  storagePlaceId: string;
  productId: string;
  volume: number;
};

export type StockLogEntry = {
  stockLogId: number;
  stockFromId: string;
  stockToId: string;
  modification: number;
  volume: number;
  logDate: string;
};

export type TransferStockResponse = {
  fromStock: StockTransferStock;
  toStock: StockTransferStock;
  stockLogEntry: StockLogEntry;
};