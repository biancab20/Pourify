export type Photo = { id: string; uri: string };

export type Supplier = {
  id: number;
  name: string;
  email: string;
};

export type DeliveryProduct = {
  productId: number;
  name: string;
  volume: number;
  type: "KEG" | "BOX" | "UNIT" | string;
};

export type DeliveryOcrResponse = {
  deliveryNoteId: number;
  deliveryDate: string; // ISO string
  supplier: Supplier;
  products: DeliveryProduct[];
  deliveryNotePictureId: string;
  deliveryPilePictureId: string;
};
