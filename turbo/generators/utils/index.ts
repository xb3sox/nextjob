import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const GENERATORS_ROOT = join(process.cwd(), "turbo/generators");

export function readGeneratorTemplate(templatePath: string) {
  return readFileSync(join(GENERATORS_ROOT, templatePath), "utf8");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function loadEnvironmentVariables(filePath: string) {
  if (!existsSync(filePath)) {
    return {};
  }

  const file = readFileSync(filePath, "utf8");
  const env: Record<string, string> = {};

  for (const line of file.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

export function loadRootEnvironmentVariables(rootPath = process.cwd()) {
  return {
    ...loadEnvironmentVariables(join(rootPath, ".env.example")),
    ...loadEnvironmentVariables(join(rootPath, ".env")),
  };
}

export async function getLatestNpmVersion(packageName: string) {
  const response = await fetch(
    `https://registry.npmjs.org/-/package/${packageName}/dist-tags`,
  );

  if (!response.ok) {
    throw new Error(`Failed to resolve npm version for ${packageName}`);
  }

  const json = (await response.json()) as { latest?: string };

  if (!json.latest) {
    throw new Error(`No latest version found for ${packageName}`);
  }

  return json.latest;
}
