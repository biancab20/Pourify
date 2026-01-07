import type { ODataList } from "@/types/odata";

export type Supplier = {
  supplierId: string;
  name: string;
  email: string;
};

export type SupplierDto = {
  SupplierId: string;
  Name: string;
  Email: string;
};

export type GetSuppliersResponse = ODataList<Supplier>;
export type GetSupplierByIdResponse = Supplier;
export type CreateSupplierResponse = Supplier;
export type UpdateSupplierResponse = Supplier;
export type DeleteSupplierResponse = { value: boolean };
