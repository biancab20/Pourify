// types/deliveries.ts
import type { ODataList } from "@/types/odata";

export type Photo = { id: string; uri: string };

export type DeliverySupplier = {
  supplierId: string;
  name: string;
  contactEmail: string;
};

export type DeliveryProduct = {
  productId: string;
  name: string;
  volume: number;
  type: string;
  totalVolume: number;
  isDeleted?: boolean;
};

export type Delivery = {
  deliveryNoteId: string;
  deliveryDate: string;

  supplier: DeliverySupplier;
  products: DeliveryProduct[];

  deliveryNotePictureIds: string[];
  deliveryPilePictureId: string | null;
};

/** ---------------- OCR endpoint (NOT OData) ----------------
 * OCR returns an ARRAY of deliveries
 */
export type DeliveryOcrResponse = Delivery;

/** ---------------- Deliveries endpoint (OData + PascalCase DTOs) ---------------- */
export type DeliverySupplierDto = {
  SupplierId: string;
  Name: string;
  ContactEmail: string;
};

export type DeliveryProductDto = {
  ProductId: string;
  Name: string;
  Volume: number;
  Type: string;
  TotalVolume: number;
};

export type DeliveryDto = {
  DeliveryNoteId: string;
  DeliveryDate: string;
  DeliveryNotePictureIds: string[];
  DeliveryPilePictureId: string | null;

  Products: DeliveryProductDto[];
  Supplier: DeliverySupplierDto;
};

/** Delivery status types */
export type DeliveryStatus =
  | "received"
  | "damaged"
  | "missing"
  | "substituted"
  | "quantity_mismatch";

/** For creating deliveries */
export type CreateDeliveryDto = {
  DeliveryNoteId: string;
  DeliveryDate: string;
  DeliveryNotePictureIds: string[];
  DeliveryPilePictureId: string | null;

  Products: {
    ProductId: string;
    Name: string;
    Volume: number;
    Type: string;
    TotalVolume: number;
  }[];

  SupplierId: string;
  Name: string;
  ContactEmail: string;

  BarId?: string;
};
export type CreateDeliveryResponse = DeliveryDto;

/** GET /delivery?$expand=products,supplier */
export type GetDeliveriesResponse = ODataList<Delivery>;
