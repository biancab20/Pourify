import {
  parseODataList,
  firstOrThrow,
  toApiError,
  guessMimeType,
} from "@/utils/api-helpers";

describe("guessMimeType", () => {
  test("returns explicit mimeType when provided", () => {
    expect(guessMimeType("file.pdf", "custom/type")).toBe("custom/type");
  });

  test("detects mime type from extension (case-insensitive)", () => {
    expect(guessMimeType("a.PDF")).toBe("application/pdf");
    expect(guessMimeType("x.jpeg")).toBe("image/jpeg");
    expect(guessMimeType("x.JPG")).toBe("image/jpeg");
    expect(guessMimeType("x.png")).toBe("image/png");
  });

  test("falls back to octet-stream", () => {
    expect(guessMimeType("x.unknown")).toBe("application/octet-stream");
    expect(guessMimeType(undefined)).toBe("application/octet-stream");
  });
});

describe("odata utils", () => {
  test("parseODataList parses valid list", () => {
    const list = parseODataList<{ id: string }>(
      JSON.stringify({ value: [{ id: "1" }] })
    );
    expect(list.value[0].id).toBe("1");
  });

  test("parseODataList throws on invalid shape", () => {
    expect(() => parseODataList("null")).toThrow("Invalid OData list shape");
    expect(() => parseODataList(JSON.stringify({ value: {} }))).toThrow(
      "Invalid OData list shape"
    );
  });

  test("firstOrThrow returns first item or throws", () => {
    expect(
      firstOrThrow<number>({ "@odata.context": "ctx", value: [123] }, "Bar")
    ).toBe(123);

    expect(() =>
      firstOrThrow<number>({ "@odata.context": "ctx", value: [] }, "Bar")
    ).toThrow("Bar not found");
  });

  test("toApiError formats ApiError", () => {
    const res = { status: 401 } as Response;
    expect(toApiError(res, "nope")).toEqual({
      message: "Request failed with status 401",
      status: 401,
      body: "nope",
    });
  });
});
