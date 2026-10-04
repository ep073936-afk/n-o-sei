import crypto from "node:crypto";
import express from "express";
import rateLimit from "express-rate-limit";
import webPush from "web-push";

function timingSafeEqual(compared, expected) {
  if (!Buffer.isBuffer(compared) || !Buffer.isBuffer(expected)) {
    return false;
  }

  if (compared.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(compared, expected);
}

export function createPushRouter({ config, store }) {
  const router = express.Router();

  router.get("/public-key", (_req, res) => {
    res.json({ publicKey: config.vapidPublicKey });
  });

  router.use(
    "/subscribe",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: { ok: false, message: "Muitas tentativas de inscrição. Tente novamente mais tarde." },
    }),
  );

  router.post("/subscribe", async (req, res) => {
    const subscription = req.body?.subscription;
    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({ ok: false, message: "Subscription inválida." });
    }

    try {
      await store.add(subscription);
      return res.status(201).json({ ok: true, subscribed: true });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message || "Não foi possível salvar a inscrição." });
    }
  });

  router.delete("/subscribe", async (req, res) => {
    const endpoint = req.body?.endpoint;
    if (!endpoint) {
      return res.status(400).json({ ok: false, message: "Endpoint obrigatório." });
    }

    await store.remove(endpoint);
    return res.json({ ok: true, unsubscribed: true });
  });

  router.post("/send", async (req, res) => {
    const providedKey = req.headers["x-admin-key"];
    const expectedKey = Buffer.from(config.adminKey, "utf8");
    const providedBuffer = Buffer.from(String(providedKey || ""), "utf8");

    if (!timingSafeEqual(providedBuffer, expectedKey)) {
      return res.status(401).json({ ok: false, message: "Chave de administração inválida." });
    }

    const { title, body, url } = req.body || {};
    const subscriptions = await store.list();
    let sent = 0;

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, JSON.stringify({
          title: title || "Apuração Brasil",
          body: body || "Atualização disponível.",
          url: url || "/",
          tag: "apuracao-brasil",
        }));
        sent += 1;
      } catch (error) {
        const code = error && error.statusCode;
        if (code === 404 || code === 410) {
          await store.remove(subscription.endpoint);
        }
      }
    }

    return res.json({ ok: true, sent });
  });

  return router;
}
