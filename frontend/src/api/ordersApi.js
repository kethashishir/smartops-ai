import { apiFetch, ensureOk } from "./config.js";

export async function getOrders() {
  const response = await apiFetch("/orders/");

  await ensureOk(response, "Failed to fetch orders");

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

  await ensureOk(response, "Failed to create order");

  return response.json();
}

export async function deleteOrder(orderId) {
  const response = await apiFetch(`/orders/${orderId}`, {
    method: "DELETE",
  });

  await ensureOk(response, "Failed to delete order");

  return response.json();
}
