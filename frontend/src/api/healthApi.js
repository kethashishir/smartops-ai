import { API_BASE_URL } from "./config.js";

export async function getHealthStatus() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}
