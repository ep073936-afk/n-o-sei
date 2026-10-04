/**
 * Formato interno normalizado de apuração.
 *
 * Regras:
 * - Nunca inventar dados eleitorais.
 * - Se a resposta oficial não vier, o app mantém status "unconfigured" ou "waiting".
 * - Os candidatos são ordenados por votos e cada UF expõe pctApurado, status e candidatos.
 */

export const CARGOS = [
  "presidente",
  "governador",
  "senador",
  "deputado-federal",
  "deputado-estadual",
];

export const TURNOS = [1, 2];

export const DEFAULT_NORMALIZED_STATE = {
  atualizadoEm: null,
  cargo: "presidente",
  turno: 1,
  nacional: {
    secoesTotalizadas: 0,
    secoesTotal: 0,
    pctApurado: null,
    candidatos: [],
  },
  ufs: {},
  status: "unconfigured",
};
