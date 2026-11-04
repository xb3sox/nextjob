import nextEnv from "@next/env";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const loadEnvFile = (filePath: string) => {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex);
    let value = trimmed.slice(separatorIndex + 1);

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\$\{([^}]+)\}/g, (_, name: string) => {
      return process.env[name] ?? "";
    });

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

loadEnvFile(path.join(repoRoot, ".env"));
loadEnvFile(path.join(repoRoot, "apps/extension/.env"));
nextEnv.loadEnvConfig(path.join(repoRoot, "apps/web"));
