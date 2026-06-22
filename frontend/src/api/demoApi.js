import { apiFetch, ensureOk } from "./config.js";

export async function seedDemoData() {
  const response = await apiFetch("/demo/seed", {
    method: "POST",
  });

  await ensureOk(response, "Failed to create demo data");

  return response.json();
}
