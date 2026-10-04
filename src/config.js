export const TSE_URL = "https://resultados.tse.jus.br/";

export const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

// BASE_URL garante que o mapa carregue também se o site for publicado em subpasta.
export const BASE_URL = import.meta.env.BASE_URL;
export const GEO_URL = `${BASE_URL}brazil-topology.json`;

export const API_URL = import.meta.env.VITE_APURACAO_API_URL ?? "";
export const POLL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 60_000;
