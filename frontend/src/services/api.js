
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

// Get customer authentication token
export function getToken() {
  return (
    localStorage.getItem("customer_token") ||
    localStorage.getItem("token") ||
    null
  );
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  const token = getToken();

  // Attach JWT only when available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Set JSON content type for JSON requests
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  // Handle empty or non-JSON responses safely
  const responseText = await response.text();

  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { message: responseText || "Invalid server response" };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}
