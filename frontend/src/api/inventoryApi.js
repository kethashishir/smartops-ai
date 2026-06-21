import { apiFetch, ensureOk } from "./config.js";

export async function getInventoryForProduct(productId) {
  const response = await apiFetch(`/inventory/${productId}`);

  await ensureOk(response, "Failed to fetch inventory");

  return response.json();
}

export async function updateInventoryForProduct(productId, currentStock) {
  const response = await apiFetch(`/inventory/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_stock: Number(currentStock),
    }),
  });

  await ensureOk(response, "Failed to update inventory");

  return response.json();
}
