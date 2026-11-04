import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { authStatePath, extensionBuildPath } from "../constants";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionDir = path.resolve(__dirname, "../..");
const repoRoot = path.resolve(extensionDir, "../..");
const authDir = path.dirname(authStatePath);
const manifestPath = path.join(extensionBuildPath, "manifest.json");

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

  if (!process.env.CI && existsSync(manifestPath)) {
    return;
  }

  execSync("pnpm exec wxt build -b chrome", {
    cwd: extensionDir,
    stdio: "inherit",
    env: process.env,
  });
};
