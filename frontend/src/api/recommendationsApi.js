import { apiFetch, ensureOk } from "./config.js";

export async function getRecommendations() {
  const response = await apiFetch("/recommendations/");

  await ensureOk(response, "Failed to fetch recommendations");

  return response.json();
}

export async function generateAllRecommendations() {
  const response = await apiFetch("/recommendations/generate_all", {
    method: "POST",
  });

  await ensureOk(response, "Failed to generate recommendations");

  return response.json();
}

export async function generateRecommendation(productId) {
  const response = await apiFetch(`/recommendations/generate/${productId}`, {
    method: "POST",
  });

  await ensureOk(response, "Failed to generate recommendation");

  return response.json();
}
