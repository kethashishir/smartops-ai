import { apiFetch } from "./config.js";

export async function getRecommendations() {
  const response = await apiFetch("/recommendations/");

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}

export async function generateAllRecommendations() {
  const response = await apiFetch("/recommendations/generate_all", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}

export async function generateRecommendation(productId) {
  const response = await apiFetch(`/recommendations/generate/${productId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}
