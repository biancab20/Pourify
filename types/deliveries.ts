import type { PaginatedResponse } from "./api";
import type { Product } from "@/types/products";

export type Photo = { id: string; uri: string };

// Supplier shape inside delivery responses (id, not supplierId)
export type DeliverySupplier = {
  id: number;
  name: string;
  email: string;
};

export type Delivery = {
  deliveryNoteId: number;
  deliveryDate: string;
  supplier: DeliverySupplier;
  products: Product[];
  deliveryNotePictureId: string;
  deliveryPilePictureId: string;
};

export type DeliveryOcrResponse = Delivery;

// /getDeliveries returns a list
export type GetDeliveriesResponse = PaginatedResponse<Delivery>;
