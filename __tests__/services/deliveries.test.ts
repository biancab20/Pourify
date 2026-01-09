import { processDeliveryNote } from "@/services/deliveries.api";

const mockAuthedFetch = jest.fn();

jest.mock("@/utils/authed-fetch", () => ({
  authedFetch: (...args: any[]) => mockAuthedFetch(...args),
}));

jest.mock("@/services/api.config", () => ({
  API: {
    photo: {
      deliveryNote: "https://test.local/photo/DeliveryNote",
    },
  },
}));

function makeRes(opts: {
  ok: boolean;
  status: number;
  text: string;
  contentType?: string;
}) {
  return {
    ok: opts.ok,
    status: opts.status,
    text: async () => opts.text,
    headers: {
      get: (k: string) =>
        k.toLowerCase() === "content-type" ? opts.contentType ?? "" : null,
    },
  };
}

describe("deliveries service", () => {
  beforeEach(() => {
    mockAuthedFetch.mockReset();
  });

  test("throws ApiError if response is not ok", async () => {
    mockAuthedFetch.mockResolvedValueOnce(
      makeRes({ ok: false, status: 401, text: "nope", contentType: "application/json" })
    );

    await expect(
      processDeliveryNote({ kind: "photos", photos: [{ id: "1", uri: "x" }] as any })
    ).rejects.toMatchObject({
      message: "Request failed with status 401",
      status: 401,
      body: "nope",
    });
  });

  test("throws on unexpected content-type", async () => {
    mockAuthedFetch.mockResolvedValueOnce(
      makeRes({ ok: true, status: 200, text: "hi", contentType: "text/plain" })
    );

    await expect(
      processDeliveryNote({ kind: "file", file: { uri: "x", name: "a.pdf" } })
    ).rejects.toMatchObject({
      message: "Unexpected response type",
      status: 200,
      body: "hi",
    });
  });

  test("returns normalized delivery on valid json", async () => {
    mockAuthedFetch.mockResolvedValueOnce(
      makeRes({
        ok: true,
        status: 200,
        contentType: "application/json",
        text: JSON.stringify({
          deliveryNoteId: "d1",
          deliveryDate: "2025-01-01",
          supplier: { supplierId: "s1", name: "S", contactEmail: "c" },
          products: [{ totalVolume: 1, productId: "p", name: "P", volume: 1, type: "t" }],
          deliveryNotePictureIds: [],
          deliveryPilePictureId: null,
        }),
      })
    );

    const r = await processDeliveryNote({ kind: "file", file: { uri: "x", name: "a.pdf" } });

    expect(r.deliveryNoteId).toBe("d1");
    expect(r.supplier.supplierId).toBe("s1");
  });
});
