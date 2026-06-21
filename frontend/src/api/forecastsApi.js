import { apiFetch, ensureOk } from "./config.js";

export async function getForecasts() {
  const response = await apiFetch("/forecast/latest");

  await ensureOk(response, "Failed to fetch forecasts");

  return response.json();
}

export async function generateForecasts() {
  const response = await apiFetch("/forecast/generate", {
    method: "POST",
  });

  await ensureOk(response, "Failed to generate forecasts");

  return response.json();
}
