import React, { PropsWithChildren } from "react";
import { Text } from "react-native";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";

// ---- mock services ----
const mockGetProducts = jest.fn();
const mockGetProductById = jest.fn();
const mockCreateProduct = jest.fn();
const mockUpdateProduct = jest.fn();
const mockDeleteProduct = jest.fn();

jest.mock("@/services/products.api", () => ({
  getProducts: (...args: any[]) => mockGetProducts(...args),
  getProductById: (...args: any[]) => mockGetProductById(...args),
  createProduct: (...args: any[]) => mockCreateProduct(...args),
  updateProduct: (...args: any[]) => mockUpdateProduct(...args),
  deleteProduct: (...args: any[]) => mockDeleteProduct(...args),
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
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function ProductsProbe({ params }: { params?: Record<string, any> }) {
  const q = useProducts(params);
  if (q.isLoading) return <Text>loading</Text>;
  if (q.error) return <Text>error</Text>;
  return <Text>count:{q.data?.value?.length ?? 0}</Text>;
}

function ProductProbe({ productId }: { productId: string }) {
  const q = useProduct(productId);
  if (!productId) return <Text>no-id</Text>;
  if (q.isLoading) return <Text>loading</Text>;
  if (q.error) return <Text>error</Text>;
  return <Text>product:{q.data?.name ?? ""}</Text>;
}

function CreateProductProbe() {
  const m = useCreateProduct();
  return (
    <Text
      onPress={() => m.mutate({ name: "Beer", volume: 0.33, type: "drink" })}
    >
      create
    </Text>
  );
}

function UpdateProductProbe() {
  const m = useUpdateProduct();
  return (
    <Text onPress={() => m.mutate({ productId: "p1", data: { name: "X" } })}>
      update
    </Text>
  );
}

function DeleteProductProbe() {
  const m = useDeleteProduct();
  return <Text onPress={() => m.mutate("p1")}>delete</Text>;
}

describe("useProducts hooks", () => {
  beforeEach(() => {
    mockGetProducts.mockReset();
    mockGetProductById.mockReset();
    mockCreateProduct.mockReset();
    mockUpdateProduct.mockReset();
    mockDeleteProduct.mockReset();
  });

  test("useProducts calls getProducts and returns data", async () => {
    mockGetProducts.mockResolvedValueOnce({
      "@odata.context": "ctx",
      value: [{ productId: "p1", name: "Beer", volume: 0.33, type: "drink" }],
    });

    const client = createTestQueryClient();
    const { getByText } = render(<ProductsProbe params={{ top: 1 }} />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("count:1")).toBeTruthy());
    expect(mockGetProducts).toHaveBeenCalledWith({ top: 1 });
  });

  test("useProducts shows error when getProducts rejects", async () => {
    mockGetProducts.mockRejectedValueOnce({ message: "boom" });

    const client = createTestQueryClient();
    const { getByText } = render(<ProductsProbe />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("error")).toBeTruthy());
  });

  test("useProduct does not run when productId is empty", async () => {
    const client = createTestQueryClient();
    const { getByText } = render(<ProductProbe productId="" />, {
      wrapper: makeWrapper(client),
    });

    expect(getByText("no-id")).toBeTruthy();
    expect(mockGetProductById).not.toHaveBeenCalled();
  });

  test("useProduct calls getProductById when productId is provided", async () => {
    mockGetProductById.mockResolvedValueOnce({
      productId: "p1",
      name: "Beer",
      volume: 0.33,
      type: "drink",
    });

    const client = createTestQueryClient();
    const { getByText } = render(<ProductProbe productId="p1" />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("product:Beer")).toBeTruthy());
    expect(mockGetProductById).toHaveBeenCalledWith("p1");
  });

  test("useCreateProduct calls createProduct and invalidates products list", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockCreateProduct.mockResolvedValueOnce({
      productId: "p2",
      name: "Beer",
      volume: 0.33,
      type: "drink",
    });

    const { getByText } = render(<CreateProductProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("create"));

    await waitFor(() =>
      expect(mockCreateProduct).toHaveBeenCalledWith({
        name: "Beer",
        volume: 0.33,
        type: "drink",
      })
    );

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["products", "list"],
    });
  });

  test("useUpdateProduct calls updateProduct and invalidates list + detail(productId)", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockUpdateProduct.mockResolvedValueOnce(undefined);

    const { getByText } = render(<UpdateProductProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("update"));

    await waitFor(() =>
      expect(mockUpdateProduct).toHaveBeenCalledWith("p1", { name: "X" })
    );

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["products", "list"],
    });
    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["products", "detail", "p1"],
    });
  });

  test("useDeleteProduct calls deleteProduct and invalidates products list", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockDeleteProduct.mockResolvedValueOnce(undefined);

    const { getByText } = render(<DeleteProductProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("delete"));

    await waitFor(() => expect(mockDeleteProduct).toHaveBeenCalled());
    expect(mockDeleteProduct.mock.calls[0][0]).toBe("p1");

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["products", "list"],
    });
  });
});
