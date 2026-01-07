import type { PaginatedResponse } from "@/types/api";

export type StockItem = {
  stockId: string; // Changed from number to string (UUID)
  storagePlaceId: string; // Changed from number to string (UUID)
  productId: string; // Changed from number to string (UUID)
  volume: number;
  lastUpdatedAt?: string; // Made optional since API response doesn't show it
};

// Add this type for the raw API response
export type ApiStocksResponse = {
  "@odata.context": string;
  value: Array<{
    StockId: string;
    StoragePlaceId: string;
    ProductId: string;
    Volume: number;
  }>;
};

// Update GetStocksResponse based on what you described
export type GetStocksResponse = {
  barId: number;
  name: string;
  totalVolume: number;
  items: StockItem[];
  totalCount: number;
  // Remove the PaginatedResponse intersection since your API doesn't follow that pattern
};

export type UpdateStockResponse = {
  stockId: string; // Changed to string
  storagePlaceId: string; // Changed to string
  productId: string; // Changed to string
  lastUpdatedAt: string;
};

export type StockTransferStock = {
  stockId: string; // Changed to string
  storagePlaceId: string; // Changed to string
  productId: string; // Changed to string
  volume: number;
};

export type StockLogEntry = {
  stockLogId: number;
  stockFromId: string; // Changed to string
  stockToId: string; // Changed to string
  modification: number;
  volume: number;
  logDate: string;
};

export type TransferStockResponse = {
  fromStock: StockTransferStock;
  toStock: StockTransferStock;
  stockLogEntry: StockLogEntry;
};

// Add this type for transfer request payload
export type TransferStockRequest = {
  fromStockId: string;
  toStockId: string;
  volume: number;
};