import { PaginatedResponse } from "@/types/api";

// Supplier from SupplierController endpoints
export type Supplier = {
  supplierId: number;
  name: string;
  email: string;
};

export type GetSuppliersResponse = PaginatedResponse<Supplier>;

export type CreateSupplierResponse = Supplier & {
  createdAt: string;
};

// Your sample shows createdAt on update too, so keep it.
// If backend changes to updatedAt, you’ll update here.
export type UpdateSupplierResponse = Supplier & {
  createdAt: string;
};

export type DeleteSupplierResponse = void;