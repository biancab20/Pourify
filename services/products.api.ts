import { API } from "@/services/api.config";
import type {
  Product,
  ProductDto,
  GetProductsResponse,
  DeleteProductResponse,
  UpdateProductResponse,
  CreateProductResponse,
} from "@/types/products";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";
import { parseODataList, toApiError, firstOrThrow } from "@/utils/odata";
import { mapProductDto } from "@/utils/api-mappers";
import type { ODataEntity } from "@/types/odata";

export async function getProducts(params?: Record<string, string | number>): Promise<GetProductsResponse> {
  const query = params
    ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : "";

  const res = await authedFetch(`${API.products.list}${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const data = parseODataList<ProductDto>(text);
    return {
      "@odata.context": data["@odata.context"],
      value: data.value.map(mapProductDto),
    };
  } catch {
    throw { message: "Failed to parse JSON response", status: res.status, body: text } satisfies ApiError;
  }
}

export async function getProductById(productId: string): Promise<Product> {
  const res = await authedFetch(API.products.byId(productId), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const list = parseODataList<ProductDto>(text);
  return mapProductDto(firstOrThrow(list, "Product"));
}

export async function createProduct(payload: { name: string; volume: number; type: string }): Promise<CreateProductResponse> {
  const res = await authedFetch(API.products.create, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ Name: payload.name, Volume: payload.volume, Type: payload.type }),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataEntity<ProductDto>;
  return mapProductDto(data);
}

/** PUT => 204 No Content */
export async function updateProduct(productId: string, payload: Partial<Product>): Promise<UpdateProductResponse> {
  const res = await authedFetch(API.products.update(productId), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ Name: payload.name, Volume: payload.volume, Type: payload.type }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw toApiError(res, text);
  }

  return;
}

/** DELETE => 204 No Content */
export async function deleteProduct(productId: string): Promise<DeleteProductResponse> {
  const res = await authedFetch(API.products.delete(productId), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw toApiError(res, text);
  }

  return;
}
