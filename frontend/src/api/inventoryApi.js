const API_BASE_URL = "http://127.0.0.1:8000";

export async function getInventoryForProduct(productId) {
  const response = await fetch(`${API_BASE_URL}/inventory/${productId}`);

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}
