import { API_BASE_URL } from "./config.js";

export async function getInventoryForProduct(productId) {
  const response = await fetch(`${API_BASE_URL}/inventory/${productId}`);

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}
