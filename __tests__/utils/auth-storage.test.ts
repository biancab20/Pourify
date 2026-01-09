import { saveSession, loadSession, clearSession } from "@/utils/auth-storage";

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock("expo-secure-store", () => ({
  getItemAsync: (...args: any[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: any[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: any[]) => mockDeleteItemAsync(...args),
}));

describe("auth-storage", () => {
  beforeEach(() => {
    mockGetItemAsync.mockReset();
    mockSetItemAsync.mockReset();
    mockDeleteItemAsync.mockReset();
  });

  test("saveSession writes JSON to SecureStore", async () => {
    await saveSession({ accessToken: "a" } as any);
    expect(mockSetItemAsync).toHaveBeenCalledTimes(1);

    const [key, value] = mockSetItemAsync.mock.calls[0];
    expect(key).toBe("auth.session");
    expect(JSON.parse(value)).toMatchObject({ accessToken: "a" });
  });

  test("loadSession returns null when empty", async () => {
    mockGetItemAsync.mockResolvedValueOnce(null);
    await expect(loadSession()).resolves.toBeNull();
  });

  test("loadSession returns parsed session when valid JSON", async () => {
    mockGetItemAsync.mockResolvedValueOnce(JSON.stringify({ token: "x" }));
    await expect(loadSession()).resolves.toEqual({ token: "x" });
  });

  test("loadSession returns null when invalid JSON", async () => {
    mockGetItemAsync.mockResolvedValueOnce("{not json");
    await expect(loadSession()).resolves.toBeNull();
  });

  test("clearSession deletes key", async () => {
    await clearSession();
    expect(mockDeleteItemAsync).toHaveBeenCalledWith("auth.session");
  });
});
