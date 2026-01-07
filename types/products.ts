import type { ODataList } from "@/types/odata";

export type ProductType = "KEG" | "WINE" | "BOX" | "UNIT" | "BOTTLE" | string;

export type Product = {
  productId: string;
  name: string;
  volume: number;
  type: ProductType;
  totalVolume?: number;
};

export type ProductDto = {
  ProductId: string;
  Name: string;
  Volume: number;
  Type: string;
  TotalVolume?: number;
};

export type GetProductsResponse = ODataList<Product>;
export type GetProductByIdResponse = Product;
export type CreateProductResponse = Product;
export type UpdateProductResponse = void;
export type DeleteProductResponse = void;
