const API_BASE_URL =
  window.DEVTRACK_API_URL ||
  "https://devtrack-w6u3.onrender.com/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("devtrack_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error("Unable to reach DevTrack. Check your connection.");
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("devtrack_token");
      if (!endpoint.startsWith("/auth/")) {
        window.dispatchEvent(new CustomEvent("devtrack:session-expired"));
      }
    }
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
}
