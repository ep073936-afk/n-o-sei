import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import webPush from "web-push";

const THRESHOLDS = [25, 50, 75, 100];

function normalizeState(payload) {
  const raw = payload && typeof payload === "object" ? payload : {};
  const source = raw.data && typeof raw.data === "object" ? raw.data : raw;

  const state = {
    status: typeof source.status === "string" ? source.status.toLowerCase() : "unconfigured",
    updatedAt: source.updatedAt || raw.updatedAt || new Date().toISOString(),
    urnasApuradasPercent:
      typeof source.urnasApuradasPercent === "number" ? source.urnasApuradasPercent : null,
    regions: Array.isArray(source.regions) ? source.regions : [],
    sourceLabel: source.sourceLabel || raw.sourceLabel || "Justiça Eleitoral / TSE",
    error: source.error || raw.error || null,
  };

  if (state.status === "waiting" || state.status === "loading" || state.status === "error") {
    return state;
  }

  if (state.status === "ready") {
    return state;
  }

  return { ...state, status: "unconfigured" };
}

function buildHash(state) {
  const stable = JSON.stringify({
    status: state?.status || "unconfigured",
    percent: state?.urnasApuradasPercent ?? null,
    updatedAt: state?.updatedAt || null,
  });
  return crypto.createHash("sha256").update(stable).digest("hex");
}

function isThresholdCrossing(previous, next) {
  const previousPercent = Number(previous?.urnasApuradasPercent ?? 0);
  const nextPercent = Number(next?.urnasApuradasPercent ?? 0);
  if (!Number.isFinite(previousPercent) || !Number.isFinite(nextPercent) || previousPercent === nextPercent) {
    return false;
  }

  return THRESHOLDS.some((threshold) => {
    const crossedDown = previousPercent < threshold && nextPercent >= threshold;
    const crossedUp = previousPercent > threshold && nextPercent <= threshold;
    return crossedDown || crossedUp;
  });
}

function shouldNotify(previous, next) {
  if (!previous || !next) return false;
  if (previous.status !== next.status) return true;
  if (isThresholdCrossing(previous, next)) return true;
  return false;
}

export function createPoller({ config, store, stateRef }) {
  let timer = null;
  let activeController = null;
  const stateFilePath = path.join(config.dataDir, "poller-state.json");

  async function readLastSent() {
    try {
      const raw = await fs.readFile(stateFilePath, "utf8");
      const parsed = JSON.parse(raw);
      return parsed || {};
    } catch {
      return {};
    }
  }

  async function persistLastSent(value) {
    await fs.mkdir(config.dataDir, { recursive: true });
    await fs.writeFile(stateFilePath, JSON.stringify(value, null, 2));
  }

  async function notifyState(state) {
    const subscriptions = await store.list();
    if (!subscriptions.length) {
      return 0;
    }

    const payload = {
      title: state.status === "ready" ? "Apuração atualizada" : "Estado da apuração",
      body:
        state.urnasApuradasPercent == null
          ? "A apuração foi atualizada."
          : `A apuração já alcançou ${state.urnasApuradasPercent}% de urnas apuradas.`,
      url: "/",
      tag: "apuracao-brasil",
    };

    let sent = 0;

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, JSON.stringify(payload));
        sent += 1;
      } catch (error) {
        const code = error && error.statusCode;
        if (code === 404 || code === 410) {
          await store.remove(subscription.endpoint);
        }
      }
    }

    return sent;
  }

  async function pollOnce() {
    if (!config.tseApiUrl) {
      stateRef.current = { status: "unconfigured" };
      return;
    }

    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(config.tseApiUrl, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const nextState = normalizeState(payload);
      const previousState = stateRef.current || { status: "unconfigured" };
      const shouldSend = shouldNotify(previousState, nextState);

      stateRef.current = nextState;

      if (shouldSend) {
        const lastSent = await readLastSent();
        const nextHash = buildHash(nextState);
        if (lastSent.hash !== nextHash) {
          await notifyState(nextState);
          await persistLastSent({ hash: nextHash, percent: nextState.urnasApuradasPercent, status: nextState.status, updatedAt: nextState.updatedAt });
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        stateRef.current = {
          ...(stateRef.current || { status: "unconfigured" }),
          status: "error",
          error: error.message || "Falha ao consultar a fonte oficial.",
        };
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  function start() {
    if (timer) {
      return;
    }

    void pollOnce();
    timer = setInterval(() => {
      void pollOnce();
    }, config.pollIntervalMs);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    activeController?.abort();
  }

  return { start, stop, pollOnce };
}
