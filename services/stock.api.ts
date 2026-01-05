// import { API } from "@/services/api.config";
// import type {
//   StockItem,
//   GetStocksResponse,
//   UpdateStockResponse,
//   TransferStockResponse,
// } from "@/types/stock";
// import type { ApiError } from "@/services/api.errors";

// /**
//  * GET /stocks
//  */
// export async function getStocks(
//   params?: Record<string, string | number>
// ): Promise<GetStocksResponse> {
//   const query = params
//     ? "?" +
//       new URLSearchParams(
//         Object.entries(params).map(([k, v]) => [k, String(v)])
//       ).toString()
//     : "";

//   const res = await fetch(`${API.stock.getStocks}${query}`, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//     },
//   });

//   const text = await res.text();

//   if (!res.ok) {
//     const err: ApiError = {
//       message: `Request failed with status ${res.status}`,
//       status: res.status,
//       body: text,
//     };
//     throw err;
//   }

//   try {
//     return JSON.parse(text) as GetStocksResponse;
//   } catch {
//     throw {
//       message: "Failed to parse JSON response",
//       status: res.status,
//       body: text,
//     } satisfies ApiError;
//   }
// }

// /**
//  * UPDATE /stocks/:id
//  */
// export async function updateStock(
//   stockId: number,
//   payload: Partial<StockItem>
// ): Promise<UpdateStockResponse> {
//   const res = await fetch(`${API.stock.updateStock}/${stockId}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     body: JSON.stringify(payload),
//   });

//   const text = await res.text();

//   if (!res.ok) {
//     const err: ApiError = {
//       message: `Request failed with status ${res.status}`,
//       status: res.status,
//       body: text,
//     };
//     throw err;
//   }

//   try {
//     return JSON.parse(text) as UpdateStockResponse;
//   } catch {
//     throw {
//       message: "Failed to parse JSON response",
//       status: res.status,
//       body: text,
//     } satisfies ApiError;
//   }
// }

// /**
//  * POST /stocks/transfer
//  */
// export async function transferStock(
//   payload: TransferStockResponse
// ): Promise<TransferStockResponse> {
//   const res = await fetch(API.stock.transferStock, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     body: JSON.stringify(payload),
//   });

//   const text = await res.text();

//   if (!res.ok) {
//     const err: ApiError = {
//       message: `Request failed with status ${res.status}`,
//       status: res.status,
//       body: text,
//     };
//     throw err;
//   }

//   try {
//     return JSON.parse(text) as TransferStockResponse;
//   } catch {
//     throw {
//       message: "Failed to parse JSON response",
//       status: res.status,
//       body: text,
//     } satisfies ApiError;
//   }
// }


// stock.api.ts
import { API } from "@/services/api.config";
import type {
  StockItem,
  GetStocksResponse,
  UpdateStockResponse,
  TransferStockResponse,
} from "@/types/stock";
import type { ApiError } from "@/services/api.errors";

// TEST DATA - REMOVE WHEN API IS READY
const TEST_STOCKS: GetStocksResponse = {
  barId: 1,
  name: "Main Bar",
  totalVolume: 156.5,
  items: [
    {
      stockId: 1,
      storagePlaceId: 1,
      productId: 1,
      volume: 50,
      lastUpdatedAt: new Date().toISOString(),
    },
    {
      stockId: 2,
      storagePlaceId: 2,
      productId: 1,
      volume: 25,
      lastUpdatedAt: new Date().toISOString(),
    },
    {
      stockId: 3,
      storagePlaceId: 1,
      productId: 2,
      volume: 30.5,
      lastUpdatedAt: new Date().toISOString(),
    },
    {
      stockId: 4,
      storagePlaceId: 3,
      productId: 3,
      volume: 12,
      lastUpdatedAt: new Date().toISOString(),
    },
    {
      stockId: 5,
      storagePlaceId: 2,
      productId: 4,
      volume: 24,
      lastUpdatedAt: new Date().toISOString(),
    },
    {
      stockId: 6,
      storagePlaceId: 1,
      productId: 5,
      volume: 15,
      lastUpdatedAt: new Date().toISOString(),
    },
  ],
  totalCount: 6,
};

const TEST_STOCKS_BAR_2: GetStocksResponse = {
  barId: 2,
  name: "Pool Bar",
  totalVolume: 89.25,
  items: [
    {
      stockId: 7,
      storagePlaceId: 4,
      productId: 1,
      volume: 35,
      lastUpdatedAt: new Date().toISOString(),
    },
    {
      stockId: 8,
      storagePlaceId: 5,
      productId: 2,
      volume: 22.5,
      lastUpdatedAt: new Date().toISOString(),
    },
    {
      stockId: 9,
      storagePlaceId: 4,
      productId: 6,
      volume: 31.75,
      lastUpdatedAt: new Date().toISOString(),
    },
  ],
  totalCount: 3,
};

const useTestData = true; // SET TO FALSE WHEN API IS READY

/**
 * GET /stocks
 */
export async function getStocks(
  params?: Record<string, string | number>
): Promise<GetStocksResponse> {
  // TEST DATA RETURN
  if (useTestData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const barId = params?.barId ? Number(params.barId) : null;
    
    if (barId === 1) {
      return { ...TEST_STOCKS };
    } else if (barId === 2) {
      return { ...TEST_STOCKS_BAR_2 };
    } else {
      return {
        barId: 0,
        name: "General Stock",
        totalVolume: 245.75,
        items: [...TEST_STOCKS.items, ...TEST_STOCKS_BAR_2.items],
        totalCount: 9,
      };
    }
  }

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
  // TEST DATA RETURN
  if (useTestData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let stock: StockItem | undefined;
    
    if (TEST_STOCKS.items.some(s => s.stockId === stockId)) {
      stock = TEST_STOCKS.items.find(s => s.stockId === stockId);
      if (stock) {
        Object.assign(stock, payload, { lastUpdatedAt: new Date().toISOString() });
      }
    } else if (TEST_STOCKS_BAR_2.items.some(s => s.stockId === stockId)) {
      stock = TEST_STOCKS_BAR_2.items.find(s => s.stockId === stockId);
      if (stock) {
        Object.assign(stock, payload, { lastUpdatedAt: new Date().toISOString() });
      }
    }
    
    if (!stock) {
      throw {
        message: "Stock not found",
        status: 404,
        body: "",
      } satisfies ApiError;
    }
    
    return {
      stockId: stock.stockId,
      storagePlaceId: stock.storagePlaceId,
      productId: stock.productId,
      lastUpdatedAt: stock.lastUpdatedAt,
    } as UpdateStockResponse;
  }

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
  // TEST DATA RETURN
  if (useTestData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { fromStock, toStock, stockLogEntry } = payload;
    
    let fromStockItem: StockItem | undefined;
    let toStockItem: StockItem | undefined;
    
    if (TEST_STOCKS.items.some(s => s.stockId === fromStock.stockId)) {
      fromStockItem = TEST_STOCKS.items.find(s => s.stockId === fromStock.stockId);
    } else if (TEST_STOCKS_BAR_2.items.some(s => s.stockId === fromStock.stockId)) {
      fromStockItem = TEST_STOCKS_BAR_2.items.find(s => s.stockId === fromStock.stockId);
    }
    
    if (TEST_STOCKS.items.some(s => s.stockId === toStock.stockId)) {
      toStockItem = TEST_STOCKS.items.find(s => s.stockId === toStock.stockId);
    } else if (TEST_STOCKS_BAR_2.items.some(s => s.stockId === toStock.stockId)) {
      toStockItem = TEST_STOCKS_BAR_2.items.find(s => s.stockId === toStock.stockId);
    }
    
    if (fromStockItem && toStockItem) {
      fromStockItem.volume -= fromStock.volume;
      toStockItem.volume += toStock.volume;
      fromStockItem.lastUpdatedAt = new Date().toISOString();
      toStockItem.lastUpdatedAt = new Date().toISOString();
    }
    
    return {
      fromStock,
      toStock,
      stockLogEntry: {
        ...stockLogEntry,
        logDate: new Date().toISOString(),
      },
    } as TransferStockResponse;
  }

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