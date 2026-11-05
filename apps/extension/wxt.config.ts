import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { type Plugin, transformWithOxc } from "vite";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "wxt";

const svgJsxTransformPlugin = (): Plugin => ({
  name: "extension-svg-jsx-transform",
  async transform(code, id) {
    const path = id.split("?")[0] ?? id;

    if (!path.endsWith(".svg")) {
      return null;
    }

    const result = await transformWithOxc(code, id, {
      lang: "jsx",
      jsx: {
        runtime: "classic",
      },
    });

    return {
      code: result.code,
      map: null,
    };
  },
});

export default defineConfig({
  manifest: async () => {
    const { appConfig } = await import("./src/config/app");
    const site = URL.canParse(appConfig.url) ? new URL(appConfig.url) : null;
    const api =
      appConfig.apiUrl && URL.canParse(appConfig.apiUrl)
        ? new URL(appConfig.apiUrl)
        : null;

    const hostPermissions = new Set<string>([
      "*://*.greenhouse.io/*",
      "*://*.lever.co/*",
      "*://*.myworkdayjobs.com/*",
      "*://*.ashbyhq.com/*",
    ]);

    if (site) {
      hostPermissions.add(`${site.protocol}//${site.hostname}/*`);
    }

    if (api) {
      hostPermissions.add(`${api.protocol}//${api.hostname}/*`);
    }

    return {
      name: appConfig.name,
      permissions: ["storage", "cookies"],
      host_permissions: Array.from(hostPermissions),
      browser_specific_settings: {
        gecko: {
          strict_min_version: "140.0",
          data_collection_permissions: {
            required: ["personallyIdentifyingInfo"],
            optional: ["technicalAndInteraction"],
          },
        },
        gecko_android: {
          strict_min_version: "142.0",
        },
      },
    };
  },
  dev: {
    server: {
      port: 1234,
    },
  },
  srcDir: "src",
  entrypointsDir: "app",
  outDir: "build",
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  imports: false,
  vite: () => ({
    plugins: [
      tailwindcss(),
      svgr({
        include: "**/*.svg",
      }),
      svgJsxTransformPlugin(),
    ],
    optimizeDeps: {
      entries: ["src/app/**/index.html"],
    },
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    define: {
      "process.env": Object.fromEntries(
        Object.entries(import.meta.env).filter(
          ([key]) => key.startsWith("VITE_") || key === "NODE_ENV",
        ),
      ),
    },
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  }),
});
