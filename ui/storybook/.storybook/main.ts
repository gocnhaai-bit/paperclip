import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const storybookConfigDir = path.dirname(fileURLToPath(import.meta.url));
const { serveWarmWorkspaceAttachment } = createRequire(import.meta.url)(
  "../../../scripts/storybook-warm-workspace-attachment.mjs",
);

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx|mdx)"],
  staticDirs: ["../../public"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: true,
  },
  viteFinal: async (baseConfig) =>
    mergeConfig(baseConfig, {
      plugins: [
        tailwindcss(),
        {
          name: "warm-workspace-attachment-fixture",
          configureServer(server) {
            server.middlewares.use(serveWarmWorkspaceAttachment);
          },
        },
      ],
      optimizeDeps: { include: ["motion/react", "react", "react-dom"] },
      resolve: {
        // Storybook's core and the react-vite builder each resolve their own
        // React under pnpm's strict tree. Any component that calls a hook from
        // a third-party package — `motion`'s useReducedMotion, in the agent
        // capsule — then gets a second copy and fails with "Invalid hook call".
        // The app's own dev server hoists one React and never hit this.
        dedupe: ["react", "react-dom"],
        alias: {
          "@": path.resolve(storybookConfigDir, "../../src"),
          lexical: path.resolve(storybookConfigDir, "../../node_modules/lexical/dist/Lexical.mjs"),
          // Vite's bundled `node:crypto` polyfill omits `createHash`, which
          // `@paperclipai/shared/external-objects.ts` imports server-side. Use
          // a no-op browser shim so the import resolves; the canonicalizer
          // only runs server-side.
          "node:crypto": path.resolve(storybookConfigDir, "node-crypto-browser-shim.ts"),
        },
      },
    }),
};

export default config;
