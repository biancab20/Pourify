import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products.api";

const mockAuthedFetch = jest.fn();

jest.mock("@/utils/authed-fetch", () => ({
  authedFetch: (...args: any[]) => mockAuthedFetch(...args),
}));

jest.mock("@/services/api.config", () => ({
  API: {
    products: {
      list: "https://test.local/product",
      byId: (id: string) => `https://test.local/product(${id})`,
      create: "https://test.local/product",
      update: (id: string) => `https://test.local/product(${id})`,
      delete: (id: string) => `https://test.local/product(${id})`,
    },
  },
}));

describe("products service", () => {
  beforeEach(() => {
    mockAuthedFetch.mockReset();
  });

  test("getProducts builds query string and maps ProductDto -> Product", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          value: [
            { ProductId: 1, Name: "Beer", Volume: "0.33", Type: "drink" },
          ],
        }),
    });

    const res = await getProducts({ top: 10, search: "x" });

    const [url, init] = mockAuthedFetch.mock.calls[0];
    expect(url).toContain("https://test.local/product?");
    expect(url).toContain("top=10");
    expect(url).toContain("search=x");
    expect(init.method).toBe("GET");

    expect(res.value).toEqual([
      {
        productId: "1",
        name: "Beer",
        volume: 0.33,
        type: "drink",
        totalVolume: undefined,
      },
    ]);
  });

  test("getProducts throws ApiError on non-ok", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "server down",
    });

    await expect(getProducts()).rejects.toMatchObject({
      message: "Request failed with status 500",
      status: 500,
      body: "server down",
    });
  });

  test("getProductById maps first item", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          value: [{ ProductId: "p1", Name: "Wine", Volume: 0.75, Type: "drink" }],
        }),
    });

    const product = await getProductById("p1");

    const [url] = mockAuthedFetch.mock.calls[0];
    expect(url).toBe("https://test.local/product(p1)");

    expect(product).toEqual({
      productId: "p1",
      name: "Wine",
      volume: 0.75,
      type: "drink",
      totalVolume: undefined,
    });
  });

  test("createProduct posts correct payload and maps response", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          ProductId: "p1",
          Name: "Beer",
          Volume: 0.33,
          Type: "drink",
        }),
    });

    const product = await createProduct({ name: "Beer", volume: 0.33, type: "drink" });

    const init = mockAuthedFetch.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    expect(init.body).toBe(JSON.stringify({ Name: "Beer", Volume: 0.33, Type: "drink" }));

    expect(product.productId).toBe("p1");
  });

  test("updateProduct returns void on ok", async () => {
    mockAuthedFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    await expect(updateProduct("p1", { name: "New" })).resolves.toBeUndefined();

    const [url, init] = mockAuthedFetch.mock.calls[0];
    expect(url).toBe("https://test.local/product(p1)");
    expect(init.method).toBe("PUT");
  });

  test("updateProduct throws ApiError on non-ok and includes body", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "bad request",
    });

    await expect(updateProduct("p1", { name: "x" })).rejects.toMatchObject({
      message: "Request failed with status 400",
      status: 400,
      body: "bad request",
    });
  });

  test("deleteProduct returns void on ok", async () => {
    mockAuthedFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    await expect(deleteProduct("p1")).resolves.toBeUndefined();

    const [url, init] = mockAuthedFetch.mock.calls[0];
    expect(url).toBe("https://test.local/product(p1)");
    expect(init.method).toBe("DELETE");
  });

  test("deleteProduct throws ApiError on non-ok and includes body", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => "not found",
    });

    await expect(deleteProduct("p1")).rejects.toMatchObject({
      message: "Request failed with status 404",
      status: 404,
      body: "not found",
    });
  });
});
