import { useState, useCallback } from "react";

const API_URL = "http://localhost:8000";

export function usePrediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pulseId, setPulseId] = useState(0);

  const predict = useCallback(async (base64Image, invert = true) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, invert }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setResult(data);
      setPulseId((id) => id + 1); // tells the visualizer to replay its reveal animation
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { predict, result, loading, error, pulseId };
}