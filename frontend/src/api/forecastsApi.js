import { apiFetch } from "./config.js";

export async function getForecasts() {
  const response = await apiFetch("/forecast/latest");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch forecasts");
  }

  return response.json();
}

export async function generateForecasts() {
  const response = await apiFetch("/forecast/generate", {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to generate forecasts");
  }

  return response.json();
}
