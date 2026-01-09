import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/suppliers.api";

const mockAuthedFetch = jest.fn();

jest.mock("@/utils/authed-fetch", () => ({
  authedFetch: (...args: any[]) => mockAuthedFetch(...args),
}));

jest.mock("@/services/api.config", () => ({
  API: {
    suppliers: {
      list: "https://test.local/supplier",
      byId: (id: string) => `https://test.local/supplier(${id})`,
      create: "https://test.local/supplier",
      update: (id: string) => `https://test.local/supplier(${id})`,
      delete: (id: string) => `https://test.local/supplier(${id})`,
    },
  },
}));

describe("suppliers service", () => {
  beforeEach(() => {
    mockAuthedFetch.mockReset();
  });

  test("getSuppliers maps SupplierDto -> Supplier", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          value: [{ SupplierId: 1, Name: "A", Email: "a@test.com" }],
        }),
    });

    const res = await getSuppliers({ top: 5 });

    const [url] = mockAuthedFetch.mock.calls[0];
    expect(url).toContain("https://test.local/supplier?");
    expect(url).toContain("top=5");

    expect(res.value).toEqual([
      { supplierId: "1", name: "A", email: "a@test.com" },
    ]);
  });

  test("getSupplierById returns first item", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          value: [{ SupplierId: "s1", Name: "Zen", Email: "z@test.com" }],
        }),
    });

    const s = await getSupplierById("s1");
    expect(s).toEqual({ supplierId: "s1", name: "Zen", email: "z@test.com" });
  });

  test("createSupplier posts raw payload and maps response", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          SupplierId: "s1",
          Name: "Zen",
          Email: "z@test.com",
        }),
    });

    const s = await createSupplier({ name: "Zen", email: "z@test.com" });

    const init = mockAuthedFetch.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "Zen", email: "z@test.com" }));

    expect(s.supplierId).toBe("s1");
  });

  test("updateSupplier only sends provided fields", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          SupplierId: "s1",
          Name: "New",
          Email: "old@test.com",
        }),
    });

    await updateSupplier("s1", { name: "New" });

    const init = mockAuthedFetch.mock.calls[0][1];
    expect(init.method).toBe("PUT");

    // should only include Name when email is undefined
    expect(JSON.parse(init.body)).toEqual({ Name: "New" });
  });

  test("deleteSupplier returns {value:true/false}", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ "@odata.context": "ctx", value: true }),
    });

    const r = await deleteSupplier("s1");
    expect(r).toEqual({ value: true });
  });

  test("getSuppliers throws ApiError on non-ok", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "boom",
    });

    await expect(getSuppliers()).rejects.toMatchObject({
      message: "Request failed with status 500",
      status: 500,
      body: "boom",
    });
  });
});
