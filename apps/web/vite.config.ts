import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import environment from "vite-plugin-environment";

// https://vitejs.dev/config/
export default defineConfig((config) => {
  const { mode } = config;

  return {
    define: { "process.env": loadEnv(mode, process.cwd(), "") },
    plugins: [react(), tsConfigPaths(), environment("all")]
  };
});
