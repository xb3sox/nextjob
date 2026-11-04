import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedEmail = process.env.SEED_EMAIL ?? "me@turbostarter.dev";
const [localPart, domain] = seedEmail.split("@");
const email =
  process.env.E2E_USER_EMAIL ??
  `${localPart}+user@${domain ?? "turbostarter.dev"}`;

export const e2eUser = {
  email,
  password:
    process.env.E2E_USER_PASSWORD ?? process.env.SEED_PASSWORD ?? "Pa$$w0rd",
  name: email.split("@")[0]?.trim() ?? "Anonymous",
};

export const authStatePath = path.resolve(
  __dirname,
  ".playwright/auth/user.json",
);

export const extensionBuildPath = path.resolve(
  __dirname,
  "../build/chrome-mv3",
);

export const webBaseUrl =
  process.env.E2E_BASE_URL ?? `http://localhost:${process.env.PORT ?? "3000"}`;
