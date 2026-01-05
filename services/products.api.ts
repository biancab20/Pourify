import { API } from "@/services/api.config";
import type {
  Product,
  GetProductsResponse,
  UpdateProductResponse,
  DeleteProductResponse,
} from "@/types/products";
import type { ApiError } from "@/services/api.errors";

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

  const res = await fetch(`${API.products.getProducts}${query}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
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
    
    // Transform the API response to match your expected type
    // Your API returns { "@odata.context": "...", "value": [...] }
    // But GetProductsResponse expects { items: [...], totalCount: ..., etc }
    
    const items = data.value || [];
    
    // Create the response matching GetProductsResponse type
    return {
      items: items.map((item: any) => ({
        productId: item.ProductId, // Note: API returns "ProductId" not "productId"
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
 * PUT /products/:id
 */
export async function updateProduct(
  productId: number,
  payload: Partial<Product>
): Promise<UpdateProductResponse> {
  const res = await fetch(`${API.products.updateProduct}/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
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
    // Transform response if needed
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
  productId: number
): Promise<DeleteProductResponse> {
  const res = await fetch(`${API.products.deleteProduct}/${productId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
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