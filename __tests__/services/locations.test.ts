import { getBars, getBarById, createBar } from "@/services/locations.api";

const mockAuthedFetch = jest.fn();

jest.mock("@/utils/authed-fetch", () => ({
  authedFetch: (...args: any[]) => mockAuthedFetch(...args),
}));

// ✅ mock API config so URL strings are predictable
jest.mock("@/services/api.config", () => ({
  API: {
    locations: {
      list: "https://test.local/bar",
      byId: (id: string) => `https://test.local/bar(${id})`,
      create: "https://test.local/bar",
      update: (id: string) => `https://test.local/bar(${id})`,
      delete: (id: string) => `https://test.local/bar(${id})`,
    },
  },
})); // adjust filename

describe("locations service", () => {
  beforeEach(() => {
    mockAuthedFetch.mockReset();
  });

  test("getBars builds query string and maps BarDto -> Bar", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          value: [{ BarId: 1, BarName: "Main" }],
        }),
    });

    const res = await getBars({ top: 10, search: "x" });

    // URLSearchParams order can vary; just assert it contains both keys
    const [url, init] = mockAuthedFetch.mock.calls[0];
    expect(url).toContain("https://test.local/bar?");
    expect(url).toContain("top=10");
    expect(url).toContain("search=x");

    expect(init.method).toBe("GET");
    expect(res.value).toEqual([{ barId: "1", name: "Main" }]);
  });

  test("getBarById returns first item or throws via firstOrThrow", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          value: [{ BarId: "b1", BarName: "Main" }],
        }),
    });

    const bar = await getBarById("b1");

    const [url] = mockAuthedFetch.mock.calls[0];
    expect(url).toBe("https://test.local/bar(b1)");

    expect(bar).toEqual({ barId: "b1", name: "Main" });
  });

  test("createBar posts correct payload", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          "@odata.context": "ctx",
          BarId: "b1",
          BarName: "New",
        }),
    });

    const bar = await createBar({ name: "New" });

    const init = mockAuthedFetch.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    expect(init.body).toBe(JSON.stringify({ BarName: "New" }));

    expect(bar).toEqual({ barId: "b1", name: "New" });
  });

  test("getBars throws ApiError on non-ok", async () => {
    mockAuthedFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "server down",
    });

    await expect(getBars()).rejects.toMatchObject({
      message: "Request failed with status 500",
      status: 500,
      body: "server down",
    });
  });
});
