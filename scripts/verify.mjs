import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const developmentDatabase = join(root, "backend/database/database.sqlite");

function databaseChecksum() {
  if (!existsSync(developmentDatabase)) return null;

  return createHash("sha256")
    .update(readFileSync(developmentDatabase))
    .digest("hex");
}

function run(label, directory, command, env = {}) {
  console.log(`\n${label}\n${command}`);
  const result = spawnSync(command, {
    cwd: join(root, directory),
    env: { ...process.env, ...env },
    shell: true,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed (exit ${result.status ?? "unknown"}).`);
  }
}

const initialChecksum = databaseChecksum();

try {
  run("Backend tests", "backend", "composer test");
  run("PHP formatting", "backend", "composer run lint");
  run("Composer configuration", "backend", "composer validate --no-check-publish");
  run("Frontend lint", "frontend", "npm run lint");
  run("TypeScript", "frontend", "npm run typecheck");

  // Each invocation starts fresh servers and resets only the dedicated E2E database.
  // The responsive audit is separate and has already been completed.
  for (const attempt of [1, 2]) {
    run(
      `Browser tests (${attempt}/2)`,
      "frontend",
      "npm run test:e2e",
      { SKIP_RESPONSIVE_AUDIT: "1" },
    );
  }

  // Keep the running development server's .next directory intact.
  run("Production build", "frontend", "npm run build", { NEXT_E2E: "1" });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (databaseChecksum() !== initialChecksum) {
    console.error("The development database changed during verification.");
    process.exitCode = 1;
  } else {
    console.log("\nDevelopment database unchanged.");
  }
}

if (!process.exitCode) console.log("All verification checks passed.");
