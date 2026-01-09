import React, { PropsWithChildren } from "react";
import { Text } from "react-native";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useBars,
  useBar,
  useCreateBar,
  useUpdateBar,
  useDeleteBar,
} from "@/hooks/useLocations";

// ---- mock services ----
const mockGetBars = jest.fn();
const mockGetBarById = jest.fn();
const mockCreateBar = jest.fn();
const mockUpdateBar = jest.fn();
const mockDeleteBar = jest.fn();

jest.mock("@/services/locations.api", () => ({
  getBars: (...args: any[]) => mockGetBars(...args),
  getBarById: (...args: any[]) => mockGetBarById(...args),
  createBar: (...args: any[]) => mockCreateBar(...args),
  updateBar: (...args: any[]) => mockUpdateBar(...args),
  deleteBar: (...args: any[]) => mockDeleteBar(...args),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // prevents timers from keeping the process alive
        gcTime: Infinity as any,
      },
      mutations: {
        retry: false,
        gcTime: Infinity as any,
      },
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

// -------- Probe components --------
function BarsProbe({ params }: { params?: Record<string, any> }) {
  const q = useBars(params);
  if (q.isLoading) return <Text>loading</Text>;
  if (q.error) return <Text>error</Text>;
  return <Text>count:{q.data?.value?.length ?? 0}</Text>;
}

function BarProbe({ barId }: { barId: string }) {
  const q = useBar(barId);
  if (!barId) return <Text>no-id</Text>;
  if (q.isLoading) return <Text>loading</Text>;
  if (q.error) return <Text>error</Text>;
  return <Text>bar:{q.data?.name ?? ""}</Text>;
}

function CreateBarProbe() {
  const m = useCreateBar();
  return <Text onPress={() => m.mutate({ name: "New" })}>create</Text>;
}

function UpdateBarProbe() {
  const m = useUpdateBar();
  return (
    <Text onPress={() => m.mutate({ barId: "b1", data: { name: "X" } })}>
      update
    </Text>
  );
}

function DeleteBarProbe() {
  const m = useDeleteBar();
  return <Text onPress={() => m.mutate("b1")}>delete</Text>;
}

describe("useLocations hooks", () => {
  beforeEach(() => {
    mockGetBars.mockReset();
    mockGetBarById.mockReset();
    mockCreateBar.mockReset();
    mockUpdateBar.mockReset();
    mockDeleteBar.mockReset();
  });

  test("useBars calls getBars and returns mapped data", async () => {
    mockGetBars.mockResolvedValueOnce({
      "@odata.context": "ctx",
      value: [{ barId: "1", name: "Main" }],
    });

    const client = createTestQueryClient();
    const { getByText } = render(<BarsProbe params={{ top: 1 }} />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("count:1")).toBeTruthy());

    expect(mockGetBars).toHaveBeenCalledWith({ top: 1 });
  });

  test("useBars shows error when getBars rejects", async () => {
    mockGetBars.mockRejectedValueOnce({ message: "boom" });

    const client = createTestQueryClient();
    const { getByText } = render(<BarsProbe />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("error")).toBeTruthy());
  });

  test("useBar does not run when barId is empty (enabled: !!barId)", async () => {
    const client = createTestQueryClient();
    const { getByText } = render(<BarProbe barId={""} />, {
      wrapper: makeWrapper(client),
    });

    expect(getByText("no-id")).toBeTruthy();
    expect(mockGetBarById).not.toHaveBeenCalled();
  });

  test("useBar calls getBarById when barId is provided", async () => {
    mockGetBarById.mockResolvedValueOnce({ barId: "b1", name: "Main" });

    const client = createTestQueryClient();
    const { getByText } = render(<BarProbe barId="b1" />, {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => expect(getByText("bar:Main")).toBeTruthy());
    expect(mockGetBarById).toHaveBeenCalledWith("b1");
  });

  test("useCreateBar calls createBar and invalidates bars list", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockCreateBar.mockResolvedValueOnce({ barId: "b2", name: "New" });

    const { getByText } = render(<CreateBarProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("create"));

    await waitFor(() =>
      expect(mockCreateBar).toHaveBeenCalledWith({ name: "New" })
    );

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["locations", "bars"],
    });
  });

  test("useUpdateBar calls updateBar and invalidates bars + bar detail", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockUpdateBar.mockResolvedValueOnce({} as any);

    const { getByText } = render(<UpdateBarProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("update"));

    await waitFor(() =>
      expect(mockUpdateBar).toHaveBeenCalledWith("b1", { name: "X" })
    );

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["locations", "bars"],
    });
    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["locations", "bar"],
    });
  });

  test("useDeleteBar calls deleteBar and invalidates bars list", async () => {
    const client = createTestQueryClient();
    const spyInvalidate = jest.spyOn(client, "invalidateQueries");

    mockDeleteBar.mockResolvedValueOnce({ value: true });

    const { getByText } = render(<DeleteBarProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("delete"));

    await waitFor(() => expect(mockDeleteBar).toHaveBeenCalled());
    expect(mockDeleteBar.mock.calls[0][0]).toBe("b1");

    expect(spyInvalidate).toHaveBeenCalledWith({
      queryKey: ["locations", "bars"],
    });
  });
});
