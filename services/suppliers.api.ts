import { API } from "@/services/api.config";
import type {
  Supplier,
  SupplierDto,
  CreateSupplierResponse,
  DeleteSupplierResponse,
  GetSuppliersResponse,
  UpdateSupplierResponse,
} from "@/types/suppliers";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";
import { parseODataList, toApiError, firstOrThrow } from "@/utils/api-helpers";
import { mapSupplierDto } from "@/utils/api-mappers";
import type { ODataBoolean, ODataEntity } from "@/types/odata";

export async function getSuppliers(
  params?: Record<string, string | number>
): Promise<GetSuppliersResponse> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

  const res = await authedFetch(`${API.suppliers.list}${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const data = parseODataList<SupplierDto>(text);
    return {
      "@odata.context": data["@odata.context"],
      value: data.value.map(mapSupplierDto),
    };
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

export async function getSupplierById(supplierId: string): Promise<Supplier> {
  const res = await authedFetch(API.suppliers.byId(supplierId), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const list = parseODataList<SupplierDto>(text);
  return mapSupplierDto(firstOrThrow(list, "Supplier"));
}

export async function createSupplier(payload: {
  name: string;
  email: string;
}): Promise<CreateSupplierResponse> {
  const res = await authedFetch(API.suppliers.create, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataEntity<SupplierDto>;
  return mapSupplierDto(data);
}

export async function updateSupplier(
  supplierId: string,
  payload: Partial<Pick<Supplier, "name" | "email">>
): Promise<UpdateSupplierResponse> {
  const apiPayload: Record<string, unknown> = {};
  if (payload.name !== undefined) apiPayload.Name = payload.name;
  if (payload.email !== undefined) apiPayload.Email = payload.email;

  const res = await authedFetch(API.suppliers.update(supplierId), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(apiPayload),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataEntity<SupplierDto>;
  return mapSupplierDto(data);
}

export async function deleteSupplier(
  supplierId: string
): Promise<DeleteSupplierResponse> {
  const res = await authedFetch(API.suppliers.delete(supplierId), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataBoolean;
  return { value: Boolean(data.value) };
}
