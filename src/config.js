export const TSE_URL = "https://resultados.tse.jus.br/";

export const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

export const BASE_URL = import.meta.env.BASE_URL;
export const GEO_URL = `${BASE_URL}brazil-topology.json`;

export const API_URL = import.meta.env.VITE_APURACAO_API_URL || "/api/apuracao";
export const POLL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 60_000;
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";
