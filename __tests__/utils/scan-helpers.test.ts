import { makeId, toPhotosFromAssets, toPickedFile } from "@/utils/scan-helpers";

describe("scan-helpers", () => {
  test("makeId returns a string containing '-'", () => {
    const id = makeId();
    expect(typeof id).toBe("string");
    expect(id).toContain("-");
  });

  test("makeId returns different ids across calls", () => {
    const a = makeId();
    const b = makeId();
    expect(a).not.toBe(b);
  });

  test("toPhotosFromAssets maps assets to photos", () => {
    const r = toPhotosFromAssets([{ uri: "a" }, { uri: "b" }]);

    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({ uri: "a" });
    expect(typeof r[0].id).toBe("string");
    expect(r[0].id.length).toBeGreaterThan(0);

    expect(r[1]).toMatchObject({ uri: "b" });
    expect(typeof r[1].id).toBe("string");
  });

  test("toPickedFile maps asset fields and adds id", () => {
    const r = toPickedFile({ uri: "u", name: "n", mimeType: "m" });

    expect(r).toMatchObject({ uri: "u", name: "n", mimeType: "m" });
    expect(typeof r.id).toBe("string");
    expect(r.id.length).toBeGreaterThan(0);
  });
});
