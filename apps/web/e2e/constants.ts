import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedEmail = process.env.SEED_EMAIL ?? "me@turbostarter.dev";
const [localPart, domain] = seedEmail.split("@");

export const e2eUser = {
  email:
    process.env.E2E_USER_EMAIL ??
    `${localPart}+user@${domain ?? "turbostarter.dev"}`,
  password:
    process.env.E2E_USER_PASSWORD ?? process.env.SEED_PASSWORD ?? "Pa$$w0rd",
};

export const authStatePath = path.resolve(
  __dirname,
  ".playwright/auth/user.json",
);

export const mailpitUrl = process.env.MAILPIT_URL ?? "http://localhost:8025";
