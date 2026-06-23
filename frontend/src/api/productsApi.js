import { apiFetch, ensureOk } from "./config.js";

export async function getProducts() {
  const response = await apiFetch("/products/");

  await ensureOk(response, "Failed to fetch products");

  return response.json();
}

export async function createProduct(product) {
  const response = await apiFetch("/products/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  await ensureOk(response, "Failed to create product");

  return response.json();
}

export async function updateProduct(productId, product) {
  const response = await apiFetch(`/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  await ensureOk(response, "Failed to update product");

  return response.json();
}

export async function deleteProduct(productId) {
  const response = await apiFetch(`/products/${productId}`, {
    method: "DELETE",
  });

  await ensureOk(response, "Failed to delete product");

  return response.json();
}
