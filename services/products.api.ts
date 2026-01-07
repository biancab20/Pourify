import { API } from "@/services/api.config";
import type {
  Product,
  GetProductsResponse,
  UpdateProductResponse,
  DeleteProductResponse,
} from "@/types/products";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";

/**
 * GET /products
 */
export async function getProducts(
  params?: Record<string, string | number>
): Promise<GetProductsResponse> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

  const res = await authedFetch(`${API.products.getProducts}${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const data = JSON.parse(text);
    const items = data.value || [];

    return {
      items: items.map((item: any) => ({
        productId: item.ProductId,
        name: item.Name,
        volume: item.Volume,
        type: item.Type,
      })),
      totalCount: items.length,
      page: 1,
      pageSize: items.length,
      totalPages: 1,
    } as GetProductsResponse;
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * POST /products
 */
export async function createProduct(payload: {
  name: string;
  volume: number;
  type: string;
}): Promise<Product> {
  const res = await authedFetch(`${API.products.updateProduct}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      Name: payload.name,
      Volume: payload.volume,
      Type: payload.type,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const data = JSON.parse(text);
    return {
      productId: data.ProductId,
      name: data.Name,
      volume: data.Volume,
      type: data.Type,
    } as Product;
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * PUT /products/:id
 */
export async function updateProduct(
  productId: string,
  payload: Partial<Product>
): Promise<UpdateProductResponse> {
  const res = await authedFetch(`${API.products.updateProduct}/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      Name: payload.name,
      Volume: payload.volume,
      Type: payload.type,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const data = JSON.parse(text);
    return {
      productId: data.ProductId,
      name: data.Name,
      volume: data.Volume,
      type: data.Type,
      updatedAt: new Date().toISOString(),
    } as UpdateProductResponse;
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * DELETE /products/:id
 * 204 No Content
 */
export async function deleteProduct(
  productId: string
): Promise<DeleteProductResponse> {
  const res = await authedFetch(`${API.products.deleteProduct}/${productId}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  return;
}
