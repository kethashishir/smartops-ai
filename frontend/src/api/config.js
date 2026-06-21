export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

let hasDispatchedSessionExpired = false;

export function getAuthToken() {
  return localStorage.getItem("smartops_token");
}

export function resetSessionExpiredDispatch() {
  hasDispatchedSessionExpired = false;
}

export async function getApiErrorMessage(response, fallbackMessage) {
  try {
    const errorData = await response.json();

    if (errorData.detail === "Not enough stock") {
      return "Not enough stock available for this order.";
    }

    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }

    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function ensureOk(response, fallbackMessage) {
  if (!response.ok) {
    const message = await getApiErrorMessage(response, fallbackMessage);
    throw new Error(message);
  }

  return response;
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

  if (response.status === 401 && !hasDispatchedSessionExpired) {
    hasDispatchedSessionExpired = true;
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
