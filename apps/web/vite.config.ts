import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import environment from "vite-plugin-environment";

// https://vitejs.dev/config/
export default defineConfig((config) => {
  return {
    plugins: [react(), tsConfigPaths(), environment("all")]
  };
});
