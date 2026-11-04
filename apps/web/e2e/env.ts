import nextEnv from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

nextEnv.loadEnvConfig(projectDir);
