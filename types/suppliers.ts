import { PaginatedResponse } from "@/types/api";

// Supplier from SupplierController endpoints
export type Supplier = {
  supplierId: string;
  name: string;
  email: string;
};

export type GetSuppliersResponse = PaginatedResponse<Supplier>;

export type CreateSupplierResponse = Supplier;
export type UpdateSupplierResponse = Supplier;
export type DeleteSupplierResponse = { value: boolean };