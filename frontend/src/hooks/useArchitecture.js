import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000";

export function useArchitecture() {
  const [architecture, setArchitecture] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/architecture`)
      .then((res) => res.json())
      .then(setArchitecture)
      .catch((err) => console.error("Failed to load architecture:", err));
  }, []);

  return architecture;
}