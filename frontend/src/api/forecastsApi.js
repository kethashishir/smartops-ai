import { API_BASE_URL } from "./config.js";

export async function getForecasts() {
  const response = await fetch(`${API_BASE_URL}/forecast/latest`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch forecasts");
  }

  return response.json();
}
