import {
  getStocks,
  getStockById,
  createStock,
  updateStock,
  transferStock,
} from "@/services/stock.api";

const mockAuthedFetch = jest.fn();

jest.mock("@/utils/authed-fetch", () => ({
  authedFetch: (...args: any[]) => mockAuthedFetch(...args),
}));

jest.mock("@/services/api.config", () => ({
  API: {
    stock: {
      list: "https://test.local/stock",
      byId: (id: string) => `https://test.local/stock(${id})`,
      create: "https://test.local/stock",
      update: (id: string) => `https://test.local/stock(${id})`,
    },
    stockTransfer: {
      transfer: "https://test.local/stocks/transfer",
    },
  },
}));

describe("stock service", () => {
  beforeEach(() => {
    mockAuthedFetch.mockReset();
  });

  test("getStocks maps StockItemDto -> StockItem", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          value: [
            { StockId: 1, StoragePlaceId: 2, ProductId: 3, Volume: "5" },
          ],
        }),
    });

    const res = await getStocks({ top: 1 });

    expect(res.value).toEqual([
      {
        stockId: "1",
        storagePlaceId: "2",
        productId: "3",
        volume: 5,
      },
    ]);
  });

  test("getStockById returns first item", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          value: [{ StockId: "s1", StoragePlaceId: "sp", ProductId: "p", Volume: 10 }],
        }),
    });

    const item = await getStockById("s1");
    expect(item).toEqual({
      stockId: "s1",
      storagePlaceId: "sp",
      productId: "p",
      volume: 10,
    });
  });

  test("createStock posts correct payload and maps response", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          StockId: "s1",
          StoragePlaceId: "sp",
          ProductId: "p",
          Volume: 10,
        }),
    });

    const item = await createStock({ storagePlaceId: "sp", productId: "p", volume: 10 });

    const init = mockAuthedFetch.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      StoragePlaceId: "sp",
      ProductId: "p",
      Volume: 10,
    });

    expect(item.stockId).toBe("s1");
  });

  test("updateStock sends StockId and maps response", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          StockId: "s1",
          StoragePlaceId: "sp2",
          ProductId: "p2",
          Volume: 9,
        }),
    });

    const updated = await updateStock("s1", {
      storagePlaceId: "sp2",
      productId: "p2",
      volume: 9,
    });

    const init = mockAuthedFetch.mock.calls[0][1];
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({
      StockId: "s1",
      StoragePlaceId: "sp2",
      ProductId: "p2",
      Volume: 9,
    });

    expect(updated).toEqual({
      stockId: "s1",
      storagePlaceId: "sp2",
      productId: "p2",
      volume: 9,
    });
  });

  test("transferStock posts correct payload and parses tolerant response", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          fromStock: { StockId: "a", StoragePlaceId: "sp1", ProductId: "p", Volume: 1 },
          toStock: { stockId: "b", storagePlaceId: "sp2", productId: "p", volume: 2 },
          stockLogEntry: { stockLogId: "l1", stockFromId: "a", stockToId: "b", modification: "x", volume: 1, logDate: "d" },
        }),
    });

    const r = await transferStock({ fromStockId: "a", toStockId: "b", volume: 1 });

    const init = mockAuthedFetch.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      FromStockId: "a",
      ToStockId: "b",
      Volume: 1,
    });

    expect(r.fromStock.stockId).toBe("a");
    expect(r.toStock.stockId).toBe("b");
    expect(r.stockLogEntry.stockLogId).toBe("l1");
  });

  test("getStocks throws ApiError on non-ok", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "boom",
    });

    await expect(getStocks()).rejects.toMatchObject({
      message: "Request failed with status 500",
      status: 500,
      body: "boom",
    });
  });
});
