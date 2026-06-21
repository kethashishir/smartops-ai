export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function getAuthToken() {
  return localStorage.getItem("smartops_token");
}

export async function apiFetch(path, options = {}) {
  const token = getAuthToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("smartops_token");

    window.dispatchEvent(
      new CustomEvent("smartops:session-expired", {
        detail: {
          message: "Session expired. Please log in again.",
        },
      }),
    );
  }

  return response;
}
