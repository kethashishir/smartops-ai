import { apiFetch, ensureOk } from "./config.js";

export async function getAssistantSummary() {
  const response = await apiFetch("/assistant/summary");

  await ensureOk(response, "Failed to load assistant summary");

  return response.json();
}

export async function askAssistant(question) {
  const response = await apiFetch("/assistant/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  await ensureOk(response, "Failed to ask assistant");

  return response.json();
}
