import dotenv from "dotenv";

dotenv.config();

function getNumber(name, fallback) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Variável de ambiente inválida: ${name}. Deve ser um número positivo.`);
  }
  return value;
}

function ensureRequired(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === "") {
    throw new Error(`Faltando variável obrigatória: ${name}. Defina-a no .env ou no painel do Railway.`);
  }
  return value;
}

export function loadConfig() {
  const port = getNumber("PORT", 3000);
  const pollIntervalMs = getNumber("POLL_INTERVAL_MS", 60000);
  const dataDir = process.env.DATA_DIR || "./data";
  const databaseUrl = process.env.DATABASE_URL || "";
  const tseApiUrl = process.env.TSE_API_URL || "";
  const vapidSubject = process.env.VAPID_SUBJECT || "";

  if (tseApiUrl) {
    try {
      new URL(tseApiUrl);
    } catch {
      throw new Error("TSE_API_URL deve ser uma URL válida.");
    }
  }

  if (vapidSubject && !/^mailto:/i.test(vapidSubject)) {
    throw new Error("VAPID_SUBJECT deve usar o formato mailto:email@dominio.");
  }

  const adminKey = ensureRequired("ADMIN_KEY");
  const vapidPublicKey = ensureRequired("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = ensureRequired("VAPID_PRIVATE_KEY");
  const vapidSubjectFinal = vapidSubject || "mailto:contato@exemplo.com";

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port,
    pollIntervalMs,
    tseApiUrl,
    dataDir,
    databaseUrl,
    adminKey,
    vapidPublicKey,
    vapidPrivateKey,
    vapidSubject: vapidSubjectFinal,
  };
}

export const config = loadConfig();
