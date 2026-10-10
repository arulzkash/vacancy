import { randomBytes } from "node:crypto";
import { existsSync, closeSync, openSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const backend = realpathSync(fileURLToPath(new URL("../../backend/", import.meta.url)));
const databaseDirectory = realpathSync(join(backend, "database"));
const database = resolve(databaseDirectory, "e2e.sqlite");
const php = process.env.PHP_BINARY ?? "php";

if (existsSync(join(backend, "bootstrap/cache/config.php"))) {
  throw new Error("Clear Laravel config cache with php artisan config:clear before E2E.");
}

// Never accept DB_DATABASE from the caller: migrate:fresh may only reset this file.
if (existsSync(database) && realpathSync(database) !== database) {
  throw new Error("E2E database must be a regular file inside backend/database.");
}
closeSync(openSync(database, "a"));

const env = {
  ...process.env,
  APP_ENV: "testing",
  APP_NAME: "Dicoding Jobs",
  APP_KEY: `base64:${randomBytes(32).toString("base64")}`,
  APP_DEBUG: "false",
  APP_URL: "http://127.0.0.1:8001",
  FRONTEND_URL: "http://127.0.0.1:3001",
  DB_CONNECTION: "sqlite",
  DB_DATABASE: database,
  DB_URL: "",
  SESSION_DRIVER: "array",
  CACHE_STORE: "array",
  QUEUE_CONNECTION: "sync",
  LOG_CHANNEL: "stderr",
};

const migration = spawnSync(php, ["artisan", "migrate:fresh", "--seed", "--force", "--no-interaction"], {
  cwd: backend,
  env,
  stdio: "inherit",
});

if (migration.error) throw migration.error;
if (migration.status !== 0) process.exit(migration.status ?? 1);

// Use PHP's server directly so Playwright owns a single server child process.
const router = join(backend, "vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php");
const server = spawn(php, ["-S", "127.0.0.1:8001", router], {
  cwd: join(backend, "public"),
  env,
  stdio: "inherit",
});

server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
server.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}
