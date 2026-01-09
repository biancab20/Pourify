import {
  mapSupplierDto,
  mapProductDto,
  mapBarDto,
  mapStockDto,
  mapDeliveryDto,
  normalizeOcrDelivery,
} from "@/utils/api-mappers";

describe("api-mappers", () => {
  test("mapSupplierDto normalizes types and nulls", () => {
    const r = mapSupplierDto({
      SupplierId: 123 as any,
      Name: null as any,
      Email: undefined as any,
    } as any);

    expect(r).toEqual({
      supplierId: "123",
      name: "",
      email: "",
    });
  });

  test("mapProductDto maps numbers and optional totalVolume", () => {
    expect(
      mapProductDto({
        ProductId: "p1",
        Name: "Beer",
        Volume: "0.33" as any,
        Type: "drink",
      } as any)
    ).toEqual({
      productId: "p1",
      name: "Beer",
      volume: 0.33,
      type: "drink",
      totalVolume: undefined,
    });

    expect(
      mapProductDto({
        ProductId: "p2",
        Name: "Wine",
        Volume: 0.75,
        Type: "drink",
        TotalVolume: "3.5" as any,
      } as any).totalVolume
    ).toBe(3.5);
  });

  test("mapBarDto uses BarName and defaults to empty string", () => {
    expect(mapBarDto({ BarId: 7 as any, BarName: "Hachi" } as any)).toEqual({
      barId: "7",
      name: "Hachi",
    });

    expect(mapBarDto({ BarId: "x", BarName: undefined } as any)).toEqual({
      barId: "x",
      name: "",
    });
  });

  test("mapStockDto maps ids to strings and volume to number", () => {
    expect(
      mapStockDto({
        StockId: 1 as any,
        StoragePlaceId: 2 as any,
        ProductId: 3 as any,
        Volume: "5" as any,
      } as any)
    ).toEqual({
      stockId: "1",
      storagePlaceId: "2",
      productId: "3",
      volume: 5,
    });
  });

  test("mapDeliveryDto maps supplier/products and normalizes arrays", () => {
    const r = mapDeliveryDto({
      DeliveryNoteId: 10 as any,
      DeliveryDate: "2025-01-01",
      Supplier: {
        SupplierId: 99 as any,
        Name: "Supplier",
        ContactEmail: "s@test.com",
      },
      Products: [
        {
          ProductId: "p1",
          Name: "Beer",
          Volume: 0.33,
          Type: "drink",
          TotalVolume: 1.0,
        },
      ],
      DeliveryNotePictureIds: [1, 2, 3],
      DeliveryPilePictureId: undefined,
    } as any);

    expect(r.deliveryNoteId).toBe("10");
    expect(r.supplier).toEqual({
      supplierId: "99",
      name: "Supplier",
      contactEmail: "s@test.com",
    });
    expect(r.products).toHaveLength(1);
    expect(r.deliveryNotePictureIds).toEqual(["1", "2", "3"]);
    expect(r.deliveryPilePictureId).toBeNull();
  });

  test("mapDeliveryDto uses empty arrays when Products/DeliveryNotePictureIds are not arrays", () => {
    const r = mapDeliveryDto({
      DeliveryNoteId: "id",
      DeliveryDate: "x",
      Supplier: { SupplierId: "s" } as any,
      Products: null,
      DeliveryNotePictureIds: undefined,
      DeliveryPilePictureId: null,
    } as any);

    expect(r.products).toEqual([]);
    expect(r.deliveryNotePictureIds).toEqual([]);
    expect(r.deliveryPilePictureId).toBeNull();
  });

  test("normalizeOcrDelivery normalizes shapes and defaults safely", () => {
    const r = normalizeOcrDelivery({
      deliveryNoteId: 1,
      deliveryDate: "2025-01-01",
      supplier: { supplierId: 2, name: null, contactEmail: undefined },
      products: [{ totalVolume: "3", productId: 4, isDeleted: undefined }],
      deliveryNotePictureIds: [10, "11"],
      deliveryPilePictureId: 99,
    });

    expect(r.deliveryNoteId).toBe("1");
    expect(r.supplier).toEqual({
      supplierId: "2",
      name: "",
      contactEmail: "",
    });
    expect(r.products[0]).toMatchObject({
      totalVolume: 3,
      productId: "4",
      isDeleted: false,
    });
    expect(r.deliveryNotePictureIds).toEqual(["10", "11"]);
    expect(r.deliveryPilePictureId).toBe("99");
  });

  test("normalizeOcrDelivery keeps deliveryPilePictureId null when null/undefined", () => {
    expect(normalizeOcrDelivery({ deliveryPilePictureId: null } as any).deliveryPilePictureId).toBeNull();
    expect(normalizeOcrDelivery({} as any).deliveryPilePictureId).toBeNull();
  });
});
