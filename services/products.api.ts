// import { API } from "@/services/api.config";
// import type {
//   Product,
//   GetProductsResponse,
//   UpdateProductResponse,
//   DeleteProductResponse,
// } from "@/types/products";
// import type { ApiError } from "@/services/api.errors";

// /**
//  * GET /products
//  */
// export async function getProducts(
//   params?: Record<string, string | number>
// ): Promise<GetProductsResponse> {
//   const query = params
//     ? "?" +
//       new URLSearchParams(
//         Object.entries(params).map(([k, v]) => [k, String(v)])
//       ).toString()
//     : "";

//   const res = await fetch(`${API.products.getProducts}${query}`, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//     },
//   });

//   const text = await res.text();

//   if (!res.ok) {
//     const err: ApiError = {
//       message: `Request failed with status ${res.status}`,
//       status: res.status,
//       body: text,
//     };
//     throw err;
//   }

//   try {
//     return JSON.parse(text) as GetProductsResponse;
//   } catch {
//     throw {
//       message: "Failed to parse JSON response",
//       status: res.status,
//       body: text,
//     } satisfies ApiError;
//   }
// }

// /**
//  * PUT /products/:id
//  */
// export async function updateProduct(
//   productId: number,
//   payload: Partial<Product>
// ): Promise<UpdateProductResponse> {
//   const res = await fetch(`${API.products.updateProduct}/${productId}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     body: JSON.stringify(payload),
//   });

//   const text = await res.text();

//   if (!res.ok) {
//     const err: ApiError = {
//       message: `Request failed with status ${res.status}`,
//       status: res.status,
//       body: text,
//     };
//     throw err;
//   }

//   try {
//     return JSON.parse(text) as UpdateProductResponse;
//   } catch {
//     throw {
//       message: "Failed to parse JSON response",
//       status: res.status,
//       body: text,
//     } satisfies ApiError;
//   }
// }

// /**
//  * DELETE /products/:id
//  * 204 No Content
//  */
// export async function deleteProduct(
//   productId: number
// ): Promise<DeleteProductResponse> {
//   const res = await fetch(`${API.products.deleteProduct}/${productId}`, {
//     method: "DELETE",
//     headers: {
//       Accept: "application/json",
//     },
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     const err: ApiError = {
//       message: `Request failed with status ${res.status}`,
//       status: res.status,
//       body: text,
//     };
//     throw err;
//   }

//   return;
// }


// products.api.ts
import { API } from "@/services/api.config";
import type {
  Product,
  GetProductsResponse,
  UpdateProductResponse,
  DeleteProductResponse,
} from "@/types/products";
import type { ApiError } from "@/services/api.errors";

// TEST DATA - REMOVE WHEN API IS READY
const TEST_PRODUCTS = {
  items: [
    {
      productId: 1,
      name: "Heineken Beer",
      volume: 3.5,
      type: "KEG",
    },
    {
      productId: 2,
      name: "Chardonnay White Wine",
      volume: 0.75,
      type: "WINE",
    },
    {
      productId: 3,
      name: "Jack Daniels Whiskey",
      volume: 1.0,
      type: "UNIT",
    },
    {
      productId: 4,
      name: "Corona Beer Box",
      volume: 24,
      type: "BOX",
    },
    {
      productId: 5,
      name: "Red Wine Merlot",
      volume: 0.75,
      type: "WINE",
    },
    {
      productId: 6,
      name: "Vodka Absolute",
      volume: 1.0,
      type: "UNIT",
    },
  ],
  totalCount: 6,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

const useTestData = true; // SET TO FALSE WHEN API IS READY

/**
 * GET /products
 */
export async function getProducts(
  params?: Record<string, string | number>
): Promise<GetProductsResponse> {
  // TEST DATA RETURN
  if (useTestData) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return { ...TEST_PRODUCTS } as GetProductsResponse;
  }

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
    return JSON.parse(text) as GetProductsResponse;
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
  // TEST DATA RETURN
  if (useTestData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = TEST_PRODUCTS.items.find(p => p.productId === productId);
    if (!product) {
      throw {
        message: "Product not found",
        status: 404,
        body: "",
      } satisfies ApiError;
    }
    return {
      ...product,
      ...payload,
      updatedAt: new Date().toISOString(),
    } as UpdateProductResponse;
  }

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
    return JSON.parse(text) as UpdateProductResponse;
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
  // TEST DATA RETURN
  if (useTestData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = TEST_PRODUCTS.items.findIndex(p => p.productId === productId);
    if (index > -1) {
      TEST_PRODUCTS.items.splice(index, 1);
      TEST_PRODUCTS.totalCount -= 1;
    }
    return;
  }

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