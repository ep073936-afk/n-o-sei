import express from "express";

export function createApuracaoRouter({ stateRef }) {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
  });

  router.get("/apuracao", (_req, res) => {
    const current = stateRef.current || { status: "unconfigured" };
    if (!current || current.status === "unconfigured") {
      return res.status(200).json({ status: "unconfigured" });
    }
    return res.json(current);
  });

  return router;
}
