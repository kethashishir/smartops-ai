import { apiFetch } from "./config.js";

export async function getOrders() {
  const response = await apiFetch("/orders/");

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

export async function createOrder(order) {
  const response = await apiFetch("/orders/", {
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
    const message =
      errorData.detail === "Not enough stock"
        ? "Not enough stock available for this order."
        : errorData.detail || "Failed to create order";

    throw new Error(message);
  }

  return response.json();
}
