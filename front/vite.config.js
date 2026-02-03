import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const baseUrl = env.VITE_BASE_URL || "http://localhost:3000";

  return {
    plugins: [react()],

    define: {
      global: "globalThis",
    },

    optimizeDeps: {
      exclude: ["cross-fetch", "motion-utils"],
    },

    resolve: {
      alias: {
        // 🔥 фикс для motion-utils (битая ESM-сборка)
        "motion-utils/dist/es/globalThis-config.mjs":
          "motion-utils/dist/cjs/index.js",
      },
    },

    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },

    // server: {
    //   host: "localhost",
    //   port: 3000,
    //   strictPort: true,
    //   cors: true,
    //   proxy: {
    //     "/ws": {
    //       target: baseUrl,
    //       changeOrigin: true,
    //       ws: true,
    //     },
    //   },
    // },
  };
});
