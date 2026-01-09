import React, { PropsWithChildren } from "react";
import { Text } from "react-native";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useProcessDeliveryNote } from "@/hooks/useDeliveries";

// ---- mock service ----
const mockProcessDeliveryNote = jest.fn();

jest.mock("@/services/deliveries.api", () => ({
  processDeliveryNote: (...args: any[]) => mockProcessDeliveryNote(...args),
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

function ProcessProbe() {
  const m = useProcessDeliveryNote();
  return (
    <Text
      onPress={() =>
        m.mutate({
          kind: "file",
          file: { uri: "x", name: "a.pdf", mimeType: "application/pdf" },
        } as any)
      }
    >
      process
    </Text>
  );
}

describe("useDeliveries hooks", () => {
  beforeEach(() => {
    mockProcessDeliveryNote.mockReset();
  });

  test("useProcessDeliveryNote calls processDeliveryNote", async () => {
    mockProcessDeliveryNote.mockResolvedValueOnce({ deliveryNoteId: "d1" } as any);

    const client = createTestQueryClient();
    const { getByText } = render(<ProcessProbe />, {
      wrapper: makeWrapper(client),
    });

    fireEvent.press(getByText("process"));

    await waitFor(() => expect(mockProcessDeliveryNote).toHaveBeenCalled());

    const arg0 = mockProcessDeliveryNote.mock.calls[0][0];
    expect(arg0.kind).toBe("file");
    expect(arg0.file.uri).toBe("x");
  });
});
