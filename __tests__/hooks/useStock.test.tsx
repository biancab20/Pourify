import React, { PropsWithChildren } from "react";
import { Text } from "react-native";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useStocks,
  useStock,
  useUpdateStock,
  useCreateStock,
  useTransferStock,
} from "@/hooks/useStock";

// ---- mock services ----
const mockGetStocks = jest.fn();
const mockGetStockById = jest.fn();
const mockUpdateStock = jest.fn();
const mockCreateStock = jest.fn();
const mockTransferStock = jest.fn();

jest.mock("@/services/stock.api", () => ({
  getStocks: (...args: any[]) => mockGetStocks(...args),
  getStockById: (...args: any[]) => mockGetStockById(...args),
  updateStock: (...args: any[]) => mockUpdateStock(...args),
  createStock: (...args: any[]) => mockCreateStock(...args),
  transferStock: (...args: any[]) => mockTransferStock(...args),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity as any },
      mutations: { retry: false, gcTime: Infinity as any },
    },
  });
}

function makeWrapper(client: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function StocksProbe({ params }: { params?: Record<string, any> }) {
  const q = useStocks(params);
  if (q.isLoading) return <Text>loading</Text>;
  if (q.error) return <Text>error</Text>;
  return <Text>count:{q.data?.value?.length ?? 0}</Text>;
}

function StockProbe({ stockId }: { stockId: string }) {
  const q = useStock(stockId);
  if (!stockId) return <Text>no-id</Text>;
  if (q.isLoading) return <Text>loading</Text>;
  if (q.error) return <Text>error</Text>;
  return <Text>stock:{q.data?.stockId ?? ""}</Text>;
}

function UpdateStockProbe() {
  const m = useUpdateStock();
  return (
    <Text
      onPress={() => m.mutate({ stockId: "st1", data: { volume: 5 } as any })}
    >
      update
    </Text>
  );
}

function CreateStockProbe() {
  const m = useCreateStock();
  return (
    <Text
      onPress={() =>
        m.mutate({ storagePlaceId: "sp", productId: "p", volume: 1 })
      }
    >
      create
    </Text>
  );
}

function TransferStockProbe() {
  const m = useTransferStock();
  return (
    <Text
      onPress={() => m.mutate({ fromStockId: "a", toStockId: "b", volume: 1 })}
    >
      transfer
    </Text>
  );
}

describe("useStock hooks", () => {
  beforeEach(() => {
    mockGetStocks.mockReset();
    mockGetStockById.mockReset();
    mockUpdateStock.mockReset();
    mockCreateStock.mockReset();
    mockTransferStock.mockReset();
  });

  test("useStocks calls getStocks and returns data", async () => {
    mockGetStocks.mockResolvedValueOnce({
      "@odata.context": "ctx",
      value: [
        { stockId: "st1", storagePlaceId: "sp", productId: "p", volume: 1 },
      ],
    });

    const client = createTestQueryClient();
    const { getByText } = render(<StocksProbe params={{ top: 1 }} />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("count:1")).toBeTruthy());
    expect(mockGetStocks).toHaveBeenCalledWith({ top: 1 });
  });

  test("useStock does not run when stockId is empty", async () => {
    const client = createTestQueryClient();
    const { getByText } = render(<StockProbe stockId="" />, {
      wrapper: makeWrapper(client),
    });

    expect(getByText("no-id")).toBeTruthy();
    expect(mockGetStockById).not.toHaveBeenCalled();
  });

  test("useStock calls getStockById when stockId is provided", async () => {
    mockGetStockById.mockResolvedValueOnce({
      stockId: "st1",
      storagePlaceId: "sp",
      productId: "p",
      volume: 1,
    });

    const client = createTestQueryClient();
    const { getByText } = render(<StockProbe stockId="st1" />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("stock:st1")).toBeTruthy());
    expect(mockGetStockById).toHaveBeenCalledWith("st1");
  });

  test("useUpdateStock calls updateStock and invalidates list + detail(stockId)", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockUpdateStock.mockResolvedValueOnce({} as any);

    const { getByText } = render(<UpdateStockProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("update"));

    await waitFor(() =>
      expect(mockUpdateStock).toHaveBeenCalledWith("st1", { volume: 5 })
    );

    expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ["stock", "list"] });
    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["stock", "detail", "st1"],
    });
  });

  test("useCreateStock calls createStock and invalidates stock list", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockCreateStock.mockResolvedValueOnce({} as any);

    const { getByText } = render(<CreateStockProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("create"));

    await waitFor(() => expect(mockCreateStock).toHaveBeenCalled());
    expect(mockCreateStock.mock.calls[0][0]).toEqual({
      storagePlaceId: "sp",
      productId: "p",
      volume: 1,
    });

    expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ["stock", "list"] });
  });

  test("useTransferStock calls transferStock and invalidates stock list", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockTransferStock.mockResolvedValueOnce({} as any);

    const { getByText } = render(<TransferStockProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("transfer"));

    await waitFor(() => expect(mockTransferStock).toHaveBeenCalled());
    expect(mockTransferStock.mock.calls[0][0]).toEqual({
      fromStockId: "a",
      toStockId: "b",
      volume: 1,
    });

    expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ["stock", "list"] });
  });
});
