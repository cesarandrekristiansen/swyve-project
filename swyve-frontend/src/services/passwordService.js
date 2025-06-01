const API_URL = process.env.REACT_APP_API_URL || "https://swyve-backend.onrender.com";

async function fetchCsrfToken() {
  const res = await fetch(`${process.env.REACT_APP_API_URLI_URL}/csrf-token`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("error getting token");
  }
  const data = await res.json();
  return data.csrfToken;
}

function getCsrfTokenFromCookie() {
  const match = document.cookie.match(/_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function sendResetEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email");
  }

  await fetchCsrfToken();


  const csrf = getCsrfTokenFromCookie();
  const res = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
    },
    body: JSON.stringify({ email }),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("unexpected response");
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || "error email");
  }
  return data;
}

export async function resetPassword(token, newPassword) {
  await fetchCsrfToken();
  const csrf = getCsrfTokenFromCookie();
  const res = await fetch(`${process.env.REACT_APP_API_URL}/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
    },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "error reset");
  }
  return data;
}
