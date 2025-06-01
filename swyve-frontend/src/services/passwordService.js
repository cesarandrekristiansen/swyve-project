const API_URL = process.env.REACT_APP_API_URL;

function getCsrfToken() {
  const match = document.cookie.match(/_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendResetEmail(email) {
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email");
  }
  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": getCsrfToken(),
    },
    body: JSON.stringify({ email }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message);
  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": getCsrfToken(),
    },
    body: JSON.stringify({ token, newPassword }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message);
  return data;
}
