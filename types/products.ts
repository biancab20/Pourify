import { PaginatedResponse } from "@/types/api";

export type ProductType = "KEG" | "WINE" | "BOX" | "UNIT" | "BOTTLE" | string;

export type Product = {
  productId: string;
  name: string;
  volume: number;
  type: ProductType;
};

// GET
export type GetProductsResponse = PaginatedResponse<Product>;

// UPDATE
export type UpdateProductResponse = Product & {
  updatedAt: string;
};

// DELETE: 204 No Content => no response body
export type DeleteProductResponse = void;