/// <reference types="node" />

import { execSync } from "node:child_process";

import {
  getLatestNpmVersion,
  loadRootEnvironmentVariables,
  readGeneratorTemplate,
  slugify,
} from "../../utils";

import type { PlopTypes } from "@turbo/gen";

interface CloudflareAnswers {
  workerName: string;
  hyperdriveId: string;
  r2BucketName: string;
  localDatabaseUrl: string;
  url: string;
}

const OPEN_NEXT_DEV_INIT = `import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
void initOpenNextCloudflareForDev();`;

const CF_SCRIPTS = {
  "cf:build": "node scripts/cf-build.mjs",
  "cf:deploy": "pnpm cf:build && opennextjs-cloudflare deploy",
  "cf:preview": "pnpm cf:build && opennextjs-cloudflare preview",
  "cf:typegen":
    "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts",
  "cf:upload": "pnpm cf:build && opennextjs-cloudflare upload",
} as const;

const CF_TURBO_TASKS = {
  "cf:build": {
    dependsOn: ["^build"],
    outputs: [".open-next/**", "!.open-next/cache/**"],
  },
  "cf:deploy": {
    cache: false,
  },
  "cf:preview": {
    cache: false,
    persistent: true,
  },
  "cf:typegen": {
    cache: false,
    outputs: ["cloudflare-env.d.ts"],
  },
  "cf:upload": {
    cache: false,
  },
} as const;

export function createCloudflareGenerator(plop: PlopTypes.NodePlopAPI): void {
  const rootEnv = loadRootEnvironmentVariables();
  const defaultWorkerName = slugify(
    rootEnv.PRODUCT_NAME ?? rootEnv.NEXT_PUBLIC_PRODUCT_NAME ?? "turbostarter",
  );

  plop.setGenerator("cloudflare", {
    description:
      "Add Cloudflare Workers deployment config for the web app (OpenNext, Wrangler, Hyperdrive)",
    prompts: [
      {
        type: "input",
        name: "workerName",
        message: "Cloudflare Worker name:",
        default: defaultWorkerName || "turbostarter",
      },
      {
        type: "input",
        name: "r2BucketName",
        message: "R2 bucket name for Next.js incremental cache:",
        default: defaultWorkerName || "turbostarter",
      },
      {
        type: "input",
        name: "hyperdriveId",
        message:
          "Hyperdrive config id (create with `wrangler hyperdrive create`):",
        default: "<your-hyperdrive-id>",
      },
      {
        type: "input",
        name: "localDatabaseUrl",
        message: "Local Postgres URL for Hyperdrive preview/dev:",
        default:
          rootEnv.DATABASE_URL ??
          "postgresql://turbostarter:turbostarter@localhost:5432/core",
      },
      {
        type: "input",
        name: "url",
        message: "App URL used in local Cloudflare dev vars:",
        default: rootEnv.URL ?? "http://localhost:3000",
      },
      {
        type: "input",
        name: "compatibilityDate",
        message: "Wrangler compatibility_date (YYYY-MM-DD):",
        default: new Date().toISOString().slice(0, 10),
      },
    ],
    actions: [
      (answers) => {
        const { workerName, r2BucketName } = answers as CloudflareAnswers;

        answers.workerName = slugify(workerName) || "turbostarter";
        answers.r2BucketName = slugify(r2BucketName) || answers.workerName;

        return "Sanitized Cloudflare generator inputs";
      },
      {
        type: "add",
        path: "apps/web/wrangler.jsonc",
        templateFile: "templates/cloudflare/wrangler.jsonc.hbs",
        force: true,
      },
      {
        type: "add",
        path: "apps/web/open-next.config.ts",
        templateFile: "templates/cloudflare/open-next.config.ts.hbs",
        force: true,
      },
      {
        type: "add",
        path: "apps/web/scripts/cf-build.mjs",
        templateFile: "templates/cloudflare/cf-build.mjs.hbs",
        force: true,
      },
      {
        type: "add",
        path: "apps/web/.dev.vars.example",
        templateFile: "templates/cloudflare/dev.vars.example.hbs",
        force: true,
      },
      {
        type: "modify",
        path: "packages/db/src/server.ts",
        transform(content) {
          if (content.includes("createDbProxy")) {
            return content;
          }

          return readGeneratorTemplate("templates/cloudflare/server.ts.hbs");
        },
      },
      {
        type: "add",
        path: "apps/web/src/middleware.ts",
        templateFile: "templates/cloudflare/middleware.ts.hbs",
        force: true,
      },
      {
        type: "modify",
        path: "apps/web/next.config.ts",
        transform(content) {
          if (content.includes("initOpenNextCloudflareForDev")) {
            return content;
          }

          return `${content.trimEnd()}\n\n${OPEN_NEXT_DEV_INIT}\n`;
        },
      },
      {
        type: "modify",
        path: "apps/web/.gitignore",
        transform(content) {
          if (content.includes(".dev.vars")) {
            return content;
          }

          return `${content.trimEnd()}\n.dev.vars\n`;
        },
      },
      {
        type: "modify",
        path: "apps/web/tsconfig.json",
        transform(content) {
          if (content.includes("cloudflare-env.d.ts")) {
            return content;
          }

          return content.replace(
            `"next-env.d.ts",`,
            `"next-env.d.ts",\n    "cloudflare-env.d.ts",`,
          );
        },
      },
      {
        type: "modify",
        path: "apps/web/package.json",
        async transform(content) {
          const pkg = JSON.parse(content) as {
            scripts?: Record<string, string>;
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
          };

          pkg.scripts ??= {};
          Object.assign(pkg.scripts, CF_SCRIPTS);

          const [openNextVersion, wranglerVersion] = await Promise.all([
            getLatestNpmVersion("@opennextjs/cloudflare"),
            getLatestNpmVersion("wrangler"),
          ]);

          pkg.dependencies ??= {};
          pkg.dependencies["@opennextjs/cloudflare"] ??= openNextVersion;

          pkg.devDependencies ??= {};
          pkg.devDependencies.wrangler ??= wranglerVersion;

          return `${JSON.stringify(pkg, null, 2)}\n`;
        },
      },
      {
        type: "modify",
        path: "packages/db/package.json",
        transform(content) {
          const pkg = JSON.parse(content) as {
            dependencies?: Record<string, string>;
            peerDependencies?: Record<string, string>;
            peerDependenciesMeta?: Record<
              string,
              {
                optional?: boolean;
              }
            >;
          };

          pkg.dependencies ??= {};
          pkg.dependencies.react ??= "catalog:react19";

          pkg.peerDependencies ??= {};
          pkg.peerDependencies["@opennextjs/cloudflare"] ??= ">=1.0.0";

          pkg.peerDependenciesMeta ??= {};
          pkg.peerDependenciesMeta["@opennextjs/cloudflare"] ??= {
            optional: true,
          };

          return `${JSON.stringify(pkg, null, 2)}\n`;
        },
      },
      {
        type: "modify",
        path: "turbo.json",
        transform(content) {
          const turbo = JSON.parse(content) as {
            tasks?: Record<string, Record<string, unknown>>;
          };

          turbo.tasks ??= {};

          for (const [taskName, taskConfig] of Object.entries(CF_TURBO_TASKS)) {
            turbo.tasks[taskName] ??= taskConfig;
          }

          return `${JSON.stringify(turbo, null, 2)}\n`;
        },
      },
      async () => {
        execSync(
          "pnpm dlx sherif@latest -r packages-without-package-json --fix",
          { stdio: "inherit" },
        );
        execSync("pnpm install", { stdio: "inherit" });
        execSync("pnpm format:fix", { stdio: "inherit" });

        try {
          execSync("pnpm --filter web cf:typegen", { stdio: "inherit" });
        } catch {
          console.warn(
            "Skipped cf:typegen. Run `pnpm --filter web cf:typegen` after setting a valid Hyperdrive id.",
          );
        }

        return [
          "Cloudflare config generated.",
          "",
          "Next steps:",
          '1. Create Hyperdrive: pnpm --filter web exec wrangler hyperdrive create <name> --connection-string="$DATABASE_URL"',
          "2. Put the returned id in apps/web/wrangler.jsonc",
          "3. Create R2 bucket: pnpm --filter web exec wrangler r2 bucket create <bucket-name>",
          "4. Copy apps/web/.dev.vars.example to apps/web/.dev.vars for local preview",
          "5. Set production secrets: pnpm --filter web exec wrangler secret bulk .env",
          "6. Deploy: pnpm --filter web cf:deploy",
        ].join("\n");
      },
    ],
  });
}
