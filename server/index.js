import compression from "compression";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import webPush from "web-push";
import { config } from "./config.js";
import { createPoller } from "./poller.js";
import { createPushRouter } from "./routes/push.js";
import { createApuracaoRouter } from "./routes/apuracao.js";
import { createStore } from "./store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicPath = path.join(rootDir, "public");
const distPath = path.join(rootDir, "dist");

const app = express();
const stateRef = { current: { status: "unconfigured" } };

webPush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey);

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173", "https://resultados.tse.jus.br"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

const store = await createStore(config);
const poller = createPoller({ config, store, stateRef });

app.use("/api", createApuracaoRouter({ stateRef }));
app.use("/api/push", createPushRouter({ config, store }));

const hasDistBuild = fs.existsSync(path.join(distPath, "index.html"));

if (fs.existsSync(publicPath)) {
  app.use(
    express.static(publicPath, {
      index: false,
      setHeaders(res, filePath) {
        const relativePath = path.relative(publicPath, filePath);
        if (relativePath === "brazil-ufs.geojson") {
          res.setHeader("Cache-Control", "public, max-age=86400");
          return;
        }
        res.setHeader("Cache-Control", "no-cache");
      },
    }),
  );
}

if (hasDistBuild) {
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        const relativePath = path.relative(distPath, filePath);
        if (relativePath === "index.html" || relativePath === "sw.js") {
          res.setHeader("Cache-Control", "no-cache");
          return;
        }

        if (relativePath.startsWith("assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        res.setHeader("Cache-Control", "public, max-age=86400");
      },
    }),
  );

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.status(404).json({
      ok: false,
      message: "Build do frontend ainda não foi gerado. Execute npm run build antes do start.",
    });
  });
}

app.use((err, _req, res, _next) => {
  console.error("Erro interno do servidor:", err.message);
  res.status(500).json({ ok: false, message: "Erro interno do servidor." });
});

poller.start();

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Servidor ouvindo em http://0.0.0.0:${config.port}`);
});
