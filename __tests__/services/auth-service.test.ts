import { AuthService } from "@/services/auth.api";

describe("AuthService", () => {
  beforeEach(() => {
    (global.fetch as any) = jest.fn();
  });

  test("loginWithPassword posts x-www-form-urlencoded", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ access_token: "a" }),
    });

    await AuthService.loginWithPassword({ username: "u", password: "p" });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];

    expect(typeof url).toBe("string");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/x-www-form-urlencoded",
    });

    // body is url-encoded
    expect(init.body).toContain("grant_type=password");
    expect(init.body).toContain("username=u");
    expect(init.body).toContain("password=p");
  });

  test("throws on non-ok response with status + body text", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "bad",
    });

    await expect(
      AuthService.loginWithPassword({ username: "u", password: "p" })
    ).rejects.toThrow("Auth failed (401): bad");
  });
});
