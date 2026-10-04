import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, POLL_MS } from "../config";

const initialState = {
  status: API_URL ? "loading" : "unconfigured", // unconfigured | loading | ready | error
  data: null,
  updatedAt: null,
  error: null,
};

/**
 * Busca os dados de apuração e atualiza sozinho a cada POLL_MS.
 * Sem VITE_APURACAO_API_URL, não faz nenhuma requisição.
 */
export function useApuracao() {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!API_URL) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch(API_URL, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState({ status: "ready", data, updatedAt: new Date(), error: null });
    } catch (err) {
      if (err.name === "AbortError") return;
      setState((prev) => ({ ...prev, status: "error", error: err.message }));
    }
  }, []);

  useEffect(() => {
    if (!API_URL) return undefined;

    refresh();
    const id = setInterval(() => {
      if (!document.hidden) refresh(); // não consulta com a aba em segundo plano
    }, POLL_MS);

    return () => {
      clearInterval(id);
      controllerRef.current?.abort();
    };
  }, [refresh]);

  return { ...state, refresh };
}
