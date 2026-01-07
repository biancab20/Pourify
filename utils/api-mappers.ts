import type {
  Supplier,
  SupplierDto,
  Product,
  ProductDto,
  Bar,
  BarDto,
  StockItem,
  StockItemDto,
  Delivery,
  DeliveryDto,
  DeliveryProduct,
  DeliveryProductDto,
  DeliverySupplier,
  DeliverySupplierDto,
} from "@/types";

export function mapSupplierDto(dto: SupplierDto): Supplier {
  return {
    supplierId: String(dto.SupplierId),
    name: String(dto.Name ?? ""),
    email: String(dto.Email ?? ""),
  };
}

export function mapProductDto(dto: ProductDto): Product {
  return {
    productId: String(dto.ProductId),
    name: String(dto.Name ?? ""),
    volume: Number(dto.Volume ?? 0),
    type: String(dto.Type ?? ""),
    totalVolume:
      dto.TotalVolume !== undefined ? Number(dto.TotalVolume) : undefined,
  };
}

export function mapBarDto(dto: BarDto): Bar {
  return {
    barId: String(dto.BarId),
    name: String(dto.BarName ?? ""),
  };
}

export function mapStockDto(dto: StockItemDto): StockItem {
  return {
    stockId: String(dto.StockId),
    storagePlaceId: String(dto.StoragePlaceId),
    productId: String(dto.ProductId),
    volume: Number(dto.Volume ?? 0),
  };
}

/** OData Delivery Supplier DTO -> domain */
export function mapDeliverySupplierDto(
  dto: DeliverySupplierDto
): DeliverySupplier {
  return {
    supplierId: String(dto.SupplierId),
    name: String(dto.Name ?? ""),
    contactEmail: String(dto.ContactEmail ?? ""),
  };
}

/** OData Delivery Product DTO -> domain */
export function mapDeliveryProductDto(
  dto: DeliveryProductDto
): DeliveryProduct {
  return {
    productId: String(dto.ProductId),
    name: String(dto.Name ?? ""),
    volume: Number(dto.Volume ?? 0),
    type: String(dto.Type ?? ""),
    totalVolume: Number(dto.TotalVolume ?? 0),
  };
}

/** OData Delivery DTO -> domain */
export function mapDeliveryDto(dto: DeliveryDto): Delivery {
  return {
    deliveryNoteId: String(dto.DeliveryNoteId),
    deliveryDate: String(dto.DeliveryDate),

    supplier: mapDeliverySupplierDto(dto.Supplier),
    products: Array.isArray(dto.Products)
      ? dto.Products.map(mapDeliveryProductDto)
      : [],

    deliveryNotePictureIds: Array.isArray(dto.DeliveryNotePictureIds)
      ? dto.DeliveryNotePictureIds.map(String)
      : [],
    deliveryPilePictureId: dto.DeliveryPilePictureId ?? null,
  };
}

/**
 * OCR already returns camelCase objects, but we still normalize to be safe
 * (ensures missing arrays/nulls don't break the UI).
 */
export function normalizeOcrDelivery(d: any): Delivery {
  return {
    deliveryNoteId: String(d.deliveryNoteId),
    deliveryDate: String(d.deliveryDate),

    supplier: {
      supplierId: String(d.supplier?.supplierId ?? ""),
      name: String(d.supplier?.name ?? ""),
      contactEmail: String(d.supplier?.contactEmail ?? ""),
    },

    products: Array.isArray(d.products)
      ? d.products.map((p: any) => ({
          productId: String(p.productId),
          name: String(p.name ?? ""),
          volume: Number(p.volume ?? 0),
          type: String(p.type ?? ""),
          totalVolume: Number(p.totalVolume ?? 0),
          isDeleted:
            p.isDeleted === undefined ? undefined : Boolean(p.isDeleted),
        }))
      : [],

    deliveryNotePictureIds: Array.isArray(d.deliveryNotePictureIds)
      ? d.deliveryNotePictureIds.map(String)
      : [],

    deliveryPilePictureId: d.deliveryPilePictureId ?? null,
  };
}
