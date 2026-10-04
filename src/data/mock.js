export const mockApuracao = {
  atualizadoEm: new Date().toISOString(),
  cargo: "presidente",
  turno: 1,
  status: "ready",
  nacional: {
    secoesTotalizadas: 122287,
    secoesTotal: 192000,
    pctApurado: 63.6,
    candidatos: [
      { id: "cand-a", nome: "Candidato A", nomeUrna: "Candidato A", partido: "PT", numero: "13", votos: 18300000, pctVotosValidos: 52.2, situacao: "em-disputa" },
      { id: "cand-b", nome: "Candidato B", nomeUrna: "Candidato B", partido: "PL", numero: "22", votos: 15200000, pctVotosValidos: 43.9, situacao: "em-disputa" },
    ],
  },
  ufs: {
    AC: { pctApurado: 67.2, status: "em-apuracao", candidatos: [
      { id: "cand-a", nome: "Candidato A", nomeUrna: "Candidato A", partido: "PT", numero: "13", votos: 110000, pctVotosValidos: 51.8, situacao: "em-disputa" },
      { id: "cand-b", nome: "Candidato B", nomeUrna: "Candidato B", partido: "PL", numero: "22", votos: 93000, pctVotosValidos: 44.2, situacao: "em-disputa" },
    ] },
    SP: { pctApurado: 73.4, status: "em-apuracao", candidatos: [
      { id: "cand-a", nome: "Candidato A", nomeUrna: "Candidato A", partido: "PT", numero: "13", votos: 4310000, pctVotosValidos: 53.3, situacao: "em-disputa" },
      { id: "cand-b", nome: "Candidato B", nomeUrna: "Candidato B", partido: "PL", numero: "22", votos: 3350000, pctVotosValidos: 41.4, situacao: "em-disputa" },
    ] },
    RJ: { pctApurado: 60.5, status: "em-apuracao", candidatos: [
      { id: "cand-a", nome: "Candidato A", nomeUrna: "Candidato A", partido: "PT", numero: "13", votos: 2100000, pctVotosValidos: 54.2, situacao: "em-disputa" },
      { id: "cand-b", nome: "Candidato B", nomeUrna: "Candidato B", partido: "PL", numero: "22", votos: 1750000, pctVotosValidos: 45.1, situacao: "em-disputa" },
    ] },
    MG: { pctApurado: 66.1, status: "em-apuracao", candidatos: [
      { id: "cand-a", nome: "Candidato A", nomeUrna: "Candidato A", partido: "PT", numero: "13", votos: 3020000, pctVotosValidos: 52.8, situacao: "em-disputa" },
      { id: "cand-b", nome: "Candidato B", nomeUrna: "Candidato B", partido: "PL", numero: "22", votos: 2610000, pctVotosValidos: 45.7, situacao: "em-disputa" },
    ] },
    RS: { pctApurado: 58.9, status: "em-apuracao", candidatos: [
      { id: "cand-a", nome: "Candidato A", nomeUrna: "Candidato A", partido: "PT", numero: "13", votos: 1480000, pctVotosValidos: 50.9, situacao: "em-disputa" },
      { id: "cand-b", nome: "Candidato B", nomeUrna: "Candidato B", partido: "PL", numero: "22", votos: 1210000, pctVotosValidos: 41.7, situacao: "em-disputa" },
    ] },
    PR: { pctApurado: 62.1, status: "em-apuracao", candidatos: [
      { id: "cand-a", nome: "Candidato A", nomeUrna: "Candidato A", partido: "PT", numero: "13", votos: 1230000, pctVotosValidos: 52.4, situacao: "em-disputa" },
      { id: "cand-b", nome: "Candidato B", nomeUrna: "Candidato B", partido: "PL", numero: "22", votos: 1040000, pctVotosValidos: 44.6, situacao: "em-disputa" },
    ] },
  },
};

export const useMock = import.meta.env.VITE_USE_MOCK === "true";
