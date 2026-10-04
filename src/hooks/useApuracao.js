import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, POLL_MS, USE_MOCK } from "../config";
import { mockApuracao } from "../data/mock.js";
import { normalizar } from "../data/adapter.js";

const initialState = {
  status: "loading",
  data: null,
  updatedAt: null,
  error: null,
};

function formatUpdatedAt(dateValue) {
  if (!dateValue) return null;
  const parsed = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function useApuracao(cargo = "presidente", turno = 1) {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef(null);
  const cacheKey = useMemo(() => `${cargo}:${turno}`, [cargo, turno]);

  const refresh = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setState((prev) => ({ ...prev, status: "loading", error: null }));

      if (USE_MOCK) {
        const mock = { ...mockApuracao, cargo, turno, status: "ready" };
        const normalized = normalizar(mock, cargo);
        setState({
          status: normalized.status === "ready" ? "ready" : "waiting",
          data: normalized,
          updatedAt: formatUpdatedAt(normalized.atualizadoEm),
          error: null,
        });
        return;
      }

      const url = `${API_URL}?cargo=${encodeURIComponent(cargo)}&turno=${encodeURIComponent(turno)}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const normalized = normalizar(payload, cargo);
      const nextState = {
        status: normalized.status === "ready" ? "ready" : normalized.status === "error" ? "error" : normalized.status === "waiting" ? "waiting" : "loading",
        data: normalized,
        updatedAt: formatUpdatedAt(normalized.atualizadoEm),
        error: normalized.status === "error" ? normalized.error || "Falha na consulta oficial." : null,
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
  }, [cargo, turno]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) {
        void refresh();
      }
    }, POLL_MS);

    return () => {
      clearInterval(timer);
      controllerRef.current?.abort();
    };
  }, [cacheKey, refresh]);

  return { ...state, refresh };
}
