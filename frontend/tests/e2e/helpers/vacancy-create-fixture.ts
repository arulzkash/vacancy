import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { test as base } from "@playwright/test";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";
const databasePath = resolve("../backend/database/e2e.sqlite");

// Clean only records created by this test, in Playwright's dedicated database.
export const test = base.extend<{ cleanupVacancies: void }>({
  cleanupVacancies: [
    async ({ page }, runTest) => {
      const createdIds: number[] = [];
      const responses: Promise<void>[] = [];

      page.on("response", (response) => {
        if (
          response.url() !== apiUrl ||
          response.request().method() !== "POST" ||
          response.status() !== 201
        )
          return;

        responses.push(
          response.json().then((payload) => {
            if (Number.isSafeInteger(payload.data?.id) && payload.data.id > 0) {
              createdIds.push(payload.data.id);
            }
          }),
        );
      });

      try {
        await runTest();
      } finally {
        await Promise.all(responses);
        if (createdIds.length > 0) {
          execFileSync(process.env.PHP_BINARY ?? "php", [
            "-r",
            '$database = new PDO("sqlite:".$argv[1]); $statement = $database->prepare("DELETE FROM vacancies WHERE id = ?"); foreach (array_slice($argv, 2) as $id) { $statement->execute([(int) $id]); }',
            databasePath,
            ...createdIds.map(String),
          ]);
        }
      }
    },
    { auto: true },
  ],
});
