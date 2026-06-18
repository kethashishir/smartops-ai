import { API_BASE_URL } from "./config.js";
export async function getRecommendations() {
  const response = await fetch(`${API_BASE_URL}/recommendations/`);

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}

export async function generateAllRecommendations() {
  const response = await fetch(`${API_BASE_URL}/recommendations/generate_all`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}

export async function generateRecommendation(productId) {
  const response = await fetch(
    `${API_BASE_URL}/recommendations/generate/${productId}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}
