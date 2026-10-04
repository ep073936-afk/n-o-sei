const PARTY_COLORS = {
  PT: "#c11b1b",
  PSDB: "#1d70ac",
  PL: "#f7d154",
  PSD: "#f0942b",
  MDB: "#5aa0ff",
  PSOL: "#7e57c2",
  PP: "#1a8f5b",
  PDT: "#1f8fd9",
  REP: "#4f85ff",
  NOVA: "#f28c28",
  UNIÃO: "#5cc6ff",
  PODE: "#6b8dff",
  PATRI: "#ff6b6b",
  PROS: "#9f7aea",
};

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getCandidateColor(candidate, index = 0) {
  const party = candidate?.partido || candidate?.partidoSigla || "";
  const normalizedParty = String(party).toUpperCase();
  const known = PARTY_COLORS[normalizedParty] || PARTY_COLORS[Object.keys(PARTY_COLORS)[index % Object.keys(PARTY_COLORS).length]];

  if (known) {
    return known;
  }

  const hue = hashString(`${candidate?.id || candidate?.nome || "candidato"}-${index}`) % 360;
  return `hsl(${hue} 70% 58%)`;
}

export function getCandidateColorWithAlpha(candidate, index = 0, opacity = 0.58) {
  const color = getCandidateColor(candidate, index);
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const full = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
    const numeric = Number.parseInt(full, 16);
    const r = (numeric >> 16) & 255;
    const g = (numeric >> 8) & 255;
    const b = numeric & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
}
