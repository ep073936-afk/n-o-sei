import { DEFAULT_NORMALIZED_STATE } from "./schema.js";

/**
 * TODO: adaptar a resposta real do TSE / Justiça Eleitoral.
 * Quando o formato oficial estiver disponível, preencher a conversão aqui.
 * Enquanto isso, o front só aceita o formato interno e mantém "Aguardando apuração".
 */
export function normalizar(respostaBruta, cargo = "presidente") {
  if (!respostaBruta || typeof respostaBruta !== "object") {
    return { ...DEFAULT_NORMALIZED_STATE, cargo, status: "unconfigured" };
  }

  const normalized = { ...DEFAULT_NORMALIZED_STATE, cargo, turno: Number(respostaBruta.turno) || 1 };

  if (respostaBruta.status === "unconfigured" || respostaBruta.status === "waiting") {
    return { ...normalized, status: "waiting" };
  }

  if (respostaBruta.ufs && typeof respostaBruta.ufs === "object") {
    normalized.ufs = respostaBruta.ufs;
  }

  if (respostaBruta.nacional && typeof respostaBruta.nacional === "object") {
    normalized.nacional = {
      ...normalized.nacional,
      ...respostaBruta.nacional,
    };
  }

  const updatedAt = respostaBruta.atualizadoEm || respostaBruta.updatedAt || respostaBruta.data?.atualizadoEm;
  normalized.atualizadoEm = updatedAt || null;

  if (respostaBruta.status === "ready") {
    normalized.status = "ready";
  }

  if (typeof respostaBruta.pctApurado === "number") {
    normalized.nacional.pctApurado = respostaBruta.pctApurado;
  }

  return normalized;
}
