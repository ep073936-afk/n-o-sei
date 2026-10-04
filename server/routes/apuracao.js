import express from "express";

export function createApuracaoRouter({ stateRef }) {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
  });

  router.get("/apuracao", (req, res) => {
    const cargo = typeof req.query.cargo === "string" ? req.query.cargo : "presidente";
    const current = stateRef.current?.byCargo?.[cargo] || stateRef.current?.default || { status: "unconfigured" };

    if (!current || current.status === "unconfigured") {
      return res.status(200).json({ status: "unconfigured", cargo });
    }

    return res.json({ ...current, cargo });
  });

  return router;
}
