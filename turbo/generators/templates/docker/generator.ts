/// <reference types="node" />

import { execSync } from "node:child_process";

import type { PlopTypes } from "@turbo/gen";

export function createDockerGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("docker", {
    description: "Generate Docker deployment files for the web app",
    prompts: [],
    actions: [
      {
        type: "modify",
        path: "apps/web/next.config.ts",
        transform(content: string) {
          if (content.includes('output: "standalone"')) {
            return content;
          }

          return content.replace(
            "const config: NextConfig = {",
            'const config: NextConfig = {\n  output: "standalone",',
          );
        },
      },
      {
        type: "add",
        path: "apps/web/Dockerfile",
        templateFile: "templates/docker/Dockerfile.hbs",
        force: true,
      },
      {
        type: "add",
        path: ".dockerignore",
        templateFile: "templates/docker/dockerignore.hbs",
        force: true,
      },
      async () => {
        execSync("pnpm format:fix", { stdio: "inherit" });

        return "Docker deployment files generated";
      },
    ],
  });
}
