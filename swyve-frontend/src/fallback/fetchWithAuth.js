export default function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");
  
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }
  