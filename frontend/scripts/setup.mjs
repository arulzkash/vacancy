import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const example = fileURLToPath(new URL("../.env.example", import.meta.url));
const local = fileURLToPath(new URL("../.env.local", import.meta.url));

if (!existsSync(local)) {
  copyFileSync(example, local);
  console.log("Created frontend .env.local from .env.example.");
} else {
  console.log("Frontend .env.local already exists; kept existing settings.");
}
