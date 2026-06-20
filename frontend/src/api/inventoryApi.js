import { apiFetch } from "./config.js";

export async function getInventoryForProduct(productId) {
  const response = await apiFetch(`/inventory/${productId}`);

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

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

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}
