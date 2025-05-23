const API_URL = process.env.REACT_APP_BASE_URL; 

export async function sendResetEmail(email) {
  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Kunne ikke sende e-post");
  }
  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Kunne ikke tilbakestille passord");
  }
  return data;
}
