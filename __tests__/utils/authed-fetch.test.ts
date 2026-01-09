import { authedFetch } from "@/utils/authed-fetch";

const mockGetValidAccessToken = jest.fn();

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: {
    getState: () => ({
      getValidAccessToken: mockGetValidAccessToken,
    }),
  },
}));

describe("authedFetch", () => {
  beforeEach(() => {
    mockGetValidAccessToken.mockReset();
    (global.fetch as any) = jest.fn();
  });

  test("throws when not authenticated", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce(null);

    await expect(authedFetch("https://x")).rejects.toThrow("Not authenticated");
  });

  test("adds Authorization header and calls fetch", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce({
      tokenType: "Bearer",
      token: "abc",
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await authedFetch("https://example.com", {
      headers: { "X-Test": "1" },
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const init = (global.fetch as jest.Mock).mock.calls[0][1];
    const headers = new Headers(init.headers);

    expect(headers.get("X-Test")).toBe("1");
    expect(headers.get("Authorization")).toBe("Bearer abc");
  });
});
