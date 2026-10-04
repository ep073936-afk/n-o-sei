import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

class JsonStore {
  constructor(dataDir) {
    this.dataDir = path.resolve(dataDir);
    this.filePath = path.join(this.dataDir, "push-subscriptions.json");
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      JSON.parse(raw);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify({ subscriptions: [] }, null, 2));
    }
  }

  async list() {
    const raw = await fs.readFile(this.filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [];
  }

  async add(subscription) {
    const entry = subscription && subscription.endpoint ? subscription : null;
    if (!entry || !entry.keys || !entry.keys.p256dh || !entry.keys.auth) {
      throw new Error("Inscrição inválida.");
    }

    const items = await this.list();
    const next = items.filter((item) => item.endpoint !== entry.endpoint);
    next.push({ endpoint: entry.endpoint, keys: entry.keys });
    await fs.writeFile(this.filePath, JSON.stringify({ subscriptions: next }, null, 2));
    return entry;
  }

  async remove(endpoint) {
    const items = await this.list();
    const next = items.filter((item) => item.endpoint !== endpoint);
    await fs.writeFile(this.filePath, JSON.stringify({ subscriptions: next }, null, 2));
    return next.length !== items.length;
  }
}

class PostgresStore {
  constructor(connectionString) {
    this.pool = new Pool({ connectionString });
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        endpoint TEXT PRIMARY KEY,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async list() {
    const { rows } = await this.pool.query(
      "SELECT endpoint, p256dh, auth FROM push_subscriptions ORDER BY created_at",
    );

    return rows.map((row) => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    }));
  }

  async add(subscription) {
    const endpoint = subscription?.endpoint;
    if (!endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      throw new Error("Inscrição inválida.");
    }

    await this.pool.query(
      `INSERT INTO push_subscriptions (endpoint, p256dh, auth)
       VALUES ($1, $2, $3)
       ON CONFLICT (endpoint)
       DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, created_at = NOW()`,
      [endpoint, subscription.keys.p256dh, subscription.keys.auth],
    );

    return subscription;
  }

  async remove(endpoint) {
    const { rowCount } = await this.pool.query("DELETE FROM push_subscriptions WHERE endpoint = $1", [endpoint]);
    return rowCount > 0;
  }
}

export async function createStore(config) {
  const store = config.databaseUrl ? new PostgresStore(config.databaseUrl) : new JsonStore(config.dataDir);
  await store.init();
  return store;
}
