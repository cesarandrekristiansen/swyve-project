const API_URL = process.env.REACT_APP_API_URL || "https://swyve-backend.onrender.com";

async function fetchCsrfToken() {
  const res = await fetch(`${API_URL}/csrf-token`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("error getting token");
  }
  const data = await res.json();
  return data.csrfToken;
}

export async function sendResetEmail(email) {

  const csrfToken = await fetchCsrfToken();

  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ email }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error("unexpected response");
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || "error email");
  }
  return data;
}

export async function resetPassword(token, newPassword) {
  const csrfToken = await fetchCsrfToken();

  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ token, newPassword }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Try agian`
    );
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || "error reset");
  }
  return data;
}
