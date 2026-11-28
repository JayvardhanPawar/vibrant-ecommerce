
import { API_URL } from "./api";

const CUSTOMER_TOKEN_KEY = "customer_token";
const CUSTOMER_DATA_KEY = "customer_data";

export function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function saveCustomerSession(token, customer) {
  if (!token) {
    throw new Error("Customer authentication token is missing");
  }

  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(customer));
}

export async function clearCustomerSession() {
  try {
    await fetch(`${API_URL}/customer/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${getCustomerToken() || ""}`
      }
    });
  } finally {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_DATA_KEY);
  }
}

export async function customerApiRequest(endpoint, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getCustomerToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    options.body &&
    typeof options.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
}
