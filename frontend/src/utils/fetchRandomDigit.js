const API_URL = "http://localhost:8000";

export async function fetchRandomDigit() {
  const res = await fetch(`${API_URL}/random-test-digit`);
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  return res.json();
}