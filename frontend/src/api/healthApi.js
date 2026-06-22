import { apiFetch, ensureOk } from "./config.js";

export async function getHealthStatus() {
  const response = await apiFetch("/health");

  await ensureOk(response, `Network response was not ok: ${response.status}`);

  return response.json();
}
