import { API_BASE_URL, ensureOk } from "./config.js";

export async function getHealthStatus() {
  const response = await fetch(`${API_BASE_URL}/health`);

  await ensureOk(response, `Network response was not ok: ${response.status}`);

  return response.json();
}
