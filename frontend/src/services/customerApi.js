
const API_URL = "http://localhost:5000/api";

export function getCustomerToken() {
  return localStorage.getItem("customer_token");
}

export function saveCustomerSession(token, customer) {
  localStorage.setItem("customer_token", token);
  localStorage.setItem("customer_data", JSON.stringify(customer));
}

export function clearCustomerSession() {
  localStorage.removeItem("customer_token");
  localStorage.removeItem("customer_data");
}

export async function customerApiRequest(endpoint, options = {}) {
  const token = getCustomerToken();

  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
