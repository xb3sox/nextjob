import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { authStatePath } from "../constants";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");
const authDir = path.dirname(authStatePath);

export default async () => {
  mkdirSync(authDir, { recursive: true });

  execSync("pnpm -F @workspace/db db:migrate", {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });

  execSync("pnpm -F @workspace/auth db:seed", {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
};
