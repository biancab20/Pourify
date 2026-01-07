import { API } from "@/services/api.config";
import type {
  Supplier,
  GetSuppliersResponse,
  CreateSupplierResponse,
  UpdateSupplierResponse,
  DeleteSupplierResponse,
} from "@/types/suppliers";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";

// OData shapes from your backend
type ODataList<T> = {
  "@odata.context"?: string;
  value: T[];
};

type ODataEntity<T> = {
  "@odata.context"?: string;
} & T;

type ODataBoolean = {
  "@odata.context"?: string;
  value: boolean;
};

function toApiError(res: Response, bodyText: string): ApiError {
  return {
    message: `Request failed with status ${res.status}`,
    status: res.status,
    body: bodyText,
  };
}

function mapSupplier(dto: any): Supplier {
  return {
    supplierId: String(dto.SupplierId),
    name: String(dto.Name ?? ""),
    email: String(dto.Email ?? ""),
  };
}

/**
 * GET /supplier
 */
export async function getSuppliers(
  params?: Record<string, string | number>
): Promise<GetSuppliersResponse> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

  const res = await authedFetch(`${API.suppliers.getSuppliers}${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const data = JSON.parse(text) as ODataList<any>;
    const items = Array.isArray(data.value) ? data.value.map(mapSupplier) : [];

    return {
      items,
      totalCount: items.length,
    };
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * POST /supplier
 */
export async function createSupplier(payload: {
  name: string;
  email: string;
}): Promise<CreateSupplierResponse> {
  const res = await authedFetch(API.suppliers.createSupplier, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const data = JSON.parse(text) as ODataEntity<any>;
    return mapSupplier(data);
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * PUT /supplier/:id
 */
export async function updateSupplier(
  supplierId: string,
  payload: Partial<Pick<Supplier, "name" | "email">>
): Promise<UpdateSupplierResponse> {
  const apiPayload: Record<string, unknown> = {};
  if (payload.name !== undefined) apiPayload.Name = payload.name;
  if (payload.email !== undefined) apiPayload.Email = payload.email;

  const res = await authedFetch(`${API.suppliers.updateSupplier}/${supplierId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(apiPayload),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const data = JSON.parse(text) as ODataEntity<any>;
    return mapSupplier(data);
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * DELETE /supplier/:id
 * API returns 200 OK with { value: true }
 */
export async function deleteSupplier(
  supplierId: string
): Promise<DeleteSupplierResponse> {
  const res = await authedFetch(`${API.suppliers.deleteSupplier}/${supplierId}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const data = JSON.parse(text) as ODataBoolean;
    return { value: Boolean(data.value) };
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}
