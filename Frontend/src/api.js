export const API_URL = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

export async function api(path, options = {}) {
  // نمایش Loading فقط هنگام عملیات ثبت و تغییر اطلاعات
  const method = (options.method || "GET").toUpperCase();
  const showLoading = method !== "GET" && !["/auth/login", "/auth/signup", "/contact"].includes(path);
  if (showLoading) {
    window.nyRequests = (window.nyRequests || 0) + 1;
    window.dispatchEvent(new CustomEvent("ny-loading", { detail: true }));
  }
  try {
  const response = await fetch(`${API_URL}/api${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
  } finally {
    if (showLoading) {
      window.nyRequests = Math.max(0, (window.nyRequests || 1) - 1);
      window.dispatchEvent(new CustomEvent("ny-loading", { detail: window.nyRequests > 0 }));
    }
  }
}
