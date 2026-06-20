import { apiFetch } from "./config.js";

export async function getProducts() {
  const response = await apiFetch("/products/");

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

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

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}
