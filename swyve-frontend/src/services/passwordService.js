const API_URL = process.env.REACT_APP_API_URL;

export async function sendResetEmail(email) {
  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from /forgot-password but received:\n${text.slice(0,200)}`);
  }
  if (!res.ok) throw new Error(data.error || data.message);
  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from /reset-password but received:\n${text.slice(0,200)}`);
  }
  if (!res.ok) throw new Error(data.error || data.message);
  return data;
}
