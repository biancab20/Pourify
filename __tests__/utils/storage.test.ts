import { getStoredString, setStoredString } from "@/utils/storage";

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock("expo-secure-store", () => ({
  getItemAsync: (...args: any[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: any[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: any[]) => mockDeleteItemAsync(...args),
}));

describe("storage", () => {
  beforeEach(() => {
    mockGetItemAsync.mockReset();
    mockSetItemAsync.mockReset();
    mockDeleteItemAsync.mockReset();
  });

  test("getStoredString returns null when undefined", async () => {
    mockGetItemAsync.mockResolvedValueOnce(undefined);
    await expect(getStoredString("k")).resolves.toBeNull();
  });

  test("getStoredString returns string when present", async () => {
    mockGetItemAsync.mockResolvedValueOnce("v");
    await expect(getStoredString("k")).resolves.toBe("v");
  });

  test("setStoredString deletes when null/empty/whitespace", async () => {
    await setStoredString("k", null);
    await setStoredString("k", "");
    await setStoredString("k", "   ");

    expect(mockDeleteItemAsync).toHaveBeenCalledTimes(3);
    expect(mockSetItemAsync).not.toHaveBeenCalled();
  });

  test("setStoredString trims and sets when valid", async () => {
    await setStoredString("k", "  hi  ");
    expect(mockSetItemAsync).toHaveBeenCalledWith("k", "hi");
  });
});
