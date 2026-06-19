import { API_BASE_URL } from "./config.js";

export async function getOrders() {
  const response = await fetch(`${API_BASE_URL}/orders/`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

export async function createOrder(order) {
  const response = await fetch(`${API_BASE_URL}/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: Number(order.product_id),
      quantity: Number(order.quantity),
      source: order.source,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create order");
  }

  return response.json();
}
