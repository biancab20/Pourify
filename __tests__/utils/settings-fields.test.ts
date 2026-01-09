import {
  getSettingsField,
  loadSettingsFieldValue,
  saveSettingsFieldValue,
  SETTINGS_FIELDS,
} from "@/utils/settings-fields";

const mockGetStoredString = jest.fn();
const mockSetStoredString = jest.fn();

jest.mock("@/utils/storage", () => ({
  getStoredString: (...args: any[]) => mockGetStoredString(...args),
  setStoredString: (...args: any[]) => mockSetStoredString(...args),
}));

describe("settings-fields", () => {
  beforeEach(() => {
    mockGetStoredString.mockReset();
    mockSetStoredString.mockReset();
  });

  test("getSettingsField returns config or null", () => {
    expect(getSettingsField("receiverEmail")).toEqual(SETTINGS_FIELDS.receiverEmail);
    expect(getSettingsField("nope")).toBeNull();
  });

  test("loadSettingsFieldValue returns empty string for null", async () => {
    mockGetStoredString.mockResolvedValueOnce(null);
    const v = await loadSettingsFieldValue(SETTINGS_FIELDS.receiverEmail);
    expect(v).toBe("");
  });

  test("saveSettingsFieldValue trims and stores", async () => {
    await saveSettingsFieldValue(SETTINGS_FIELDS.receiverEmail, "  a@b.com  ");
    expect(mockSetStoredString).toHaveBeenCalledWith("receiverEmail", "a@b.com");
  });

  test("saveSettingsFieldValue clears when allowEmpty and empty", async () => {
    await saveSettingsFieldValue(SETTINGS_FIELDS.receiverEmail, "   ");
    expect(mockSetStoredString).toHaveBeenCalledWith("receiverEmail", null);
  });

  test("saveSettingsFieldValue validates number fields", async () => {
    const field = {
      ...SETTINGS_FIELDS.receiverEmail,
      fieldType: "number" as const,
      allowEmpty: false,
      storageKey: "someNumber",
    };

    await expect(saveSettingsFieldValue(field, "abc")).rejects.toThrow(
      "Please enter a valid number."
    );

    await saveSettingsFieldValue(field, " 5 ");
    expect(mockSetStoredString).toHaveBeenCalledWith("someNumber", "5");
  });

  test("number field stores null for empty", async () => {
    const field = {
      ...SETTINGS_FIELDS.receiverEmail,
      fieldType: "number" as const,
      storageKey: "someNumber",
    };

    await saveSettingsFieldValue(field, "");
    expect(mockSetStoredString).toHaveBeenCalledWith("someNumber", null);
  });
});
