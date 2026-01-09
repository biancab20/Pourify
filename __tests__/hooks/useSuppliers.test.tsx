import React, { PropsWithChildren } from "react";
import { Text } from "react-native";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useSuppliers,
  useSupplier,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/useSuppliers";

// ---- mock services ----
const mockGetSuppliers = jest.fn();
const mockGetSupplierById = jest.fn();
const mockCreateSupplier = jest.fn();
const mockUpdateSupplier = jest.fn();
const mockDeleteSupplier = jest.fn();

jest.mock("@/services/suppliers.api", () => ({
  getSuppliers: (...args: any[]) => mockGetSuppliers(...args),
  getSupplierById: (...args: any[]) => mockGetSupplierById(...args),
  createSupplier: (...args: any[]) => mockCreateSupplier(...args),
  updateSupplier: (...args: any[]) => mockUpdateSupplier(...args),
  deleteSupplier: (...args: any[]) => mockDeleteSupplier(...args),
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

function SuppliersProbe({ params }: { params?: Record<string, any> }) {
  const q = useSuppliers(params);
  if (q.isLoading) return <Text>loading</Text>;
  if (q.error) return <Text>error</Text>;
  return <Text>count:{q.data?.value?.length ?? 0}</Text>;
}

function SupplierProbe({ supplierId }: { supplierId: string }) {
  const q = useSupplier(supplierId);
  if (!supplierId) return <Text>no-id</Text>;
  if (q.isLoading) return <Text>loading</Text>;
  if (q.error) return <Text>error</Text>;
  return <Text>supplier:{q.data?.name ?? ""}</Text>;
}

function CreateSupplierProbe() {
  const m = useCreateSupplier();
  return (
    <Text onPress={() => m.mutate({ name: "Zen", email: "z@test.com" })}>
      create
    </Text>
  );
}

function UpdateSupplierProbe() {
  const m = useUpdateSupplier();
  return (
    <Text onPress={() => m.mutate({ supplierId: "s1", data: { name: "New" } })}>
      update
    </Text>
  );
}

function DeleteSupplierProbe() {
  const m = useDeleteSupplier();
  return <Text onPress={() => m.mutate("s1")}>delete</Text>;
}

describe("useSuppliers hooks", () => {
  beforeEach(() => {
    mockGetSuppliers.mockReset();
    mockGetSupplierById.mockReset();
    mockCreateSupplier.mockReset();
    mockUpdateSupplier.mockReset();
    mockDeleteSupplier.mockReset();
  });

  test("useSuppliers calls getSuppliers and returns data", async () => {
    mockGetSuppliers.mockResolvedValueOnce({
      "@odata.context": "ctx",
      value: [{ supplierId: "1", name: "A", email: "a@test.com" }],
    });

    const client = createTestQueryClient();
    const { getByText } = render(<SuppliersProbe params={{ top: 1 }} />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("count:1")).toBeTruthy());
    expect(mockGetSuppliers).toHaveBeenCalledWith({ top: 1 });
  });

  test("useSuppliers shows error when getSuppliers rejects", async () => {
    mockGetSuppliers.mockRejectedValueOnce({ message: "boom" });

    const client = createTestQueryClient();
    const { getByText } = render(<SuppliersProbe />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("error")).toBeTruthy());
  });

  test("useSupplier does not run when supplierId is empty", async () => {
    const client = createTestQueryClient();
    const { getByText } = render(<SupplierProbe supplierId="" />, {
      wrapper: makeWrapper(client),
    });

    expect(getByText("no-id")).toBeTruthy();
    expect(mockGetSupplierById).not.toHaveBeenCalled();
  });

  test("useSupplier calls getSupplierById when supplierId is provided", async () => {
    mockGetSupplierById.mockResolvedValueOnce({
      supplierId: "s1",
      name: "Zen",
      email: "z@test.com",
    });

    const client = createTestQueryClient();
    const { getByText } = render(<SupplierProbe supplierId="s1" />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("supplier:Zen")).toBeTruthy());
    expect(mockGetSupplierById).toHaveBeenCalledWith("s1");
  });

  test("useCreateSupplier calls createSupplier and invalidates suppliers list", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockCreateSupplier.mockResolvedValueOnce({
      supplierId: "s2",
      name: "Zen",
      email: "z@test.com",
    });

    const { getByText } = render(<CreateSupplierProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("create"));

    await waitFor(() => expect(mockCreateSupplier).toHaveBeenCalled());
    expect(mockCreateSupplier.mock.calls[0][0]).toEqual({
      name: "Zen",
      email: "z@test.com",
    });

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["suppliers", "list"],
    });
  });

  test("useUpdateSupplier calls updateSupplier and invalidates list + detail(supplierId)", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockUpdateSupplier.mockResolvedValueOnce({} as any);

    const { getByText } = render(<UpdateSupplierProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("update"));

    await waitFor(() =>
      expect(mockUpdateSupplier).toHaveBeenCalledWith("s1", { name: "New" })
    );

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["suppliers", "list"],
    });
    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["suppliers", "detail", "s1"],
    });
  });

  test("useDeleteSupplier calls deleteSupplier and invalidates suppliers list", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockDeleteSupplier.mockResolvedValueOnce(undefined);

    const { getByText } = render(<DeleteSupplierProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("delete"));

    await waitFor(() => expect(mockDeleteSupplier).toHaveBeenCalled());
    expect(mockDeleteSupplier.mock.calls[0][0]).toBe("s1");

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["suppliers", "list"],
    });
  });
});
