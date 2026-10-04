import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, POLL_MS } from "../config";

const initialState = {
  status: "loading",
  data: null,
  updatedAt: null,
  error: null,
};

export function useApuracao() {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef(null);

  const refresh = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setState((prev) => ({ ...prev, status: "loading", error: null }));
      const response = await fetch(API_URL, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const nextState = {
        status: payload.status === "error" ? "error" : payload.status === "waiting" ? "waiting" : "ready",
        data: payload,
        updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : null,
        error: payload.error ?? null,
      };

      setState(nextState);
    } catch (error) {
      if (error.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error.message || "Não foi possível consultar a fonte oficial.",
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, POLL_MS);

    return () => {
      clearInterval(timer);
      controllerRef.current?.abort();
    };
  }, [refresh]);

  return { ...state, refresh };
}
