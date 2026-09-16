const API_BASE_URL =
  window.DEVTRACK_API_URL ||
  "https://devtrack-w6u3.onrender.com/api";

export async function apiRequest(
  endpoint,
  options = {}
) {
  const token = localStorage.getItem("devtrack_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
  if (response.status === 401) {
    localStorage.removeItem("devtrack_token");

    window.location.reload();

    throw new Error("Your session has expired");
  }

  throw new Error(
    data.message || "Something went wrong"
  );
}

  return data;
}

