import { glob } from "glob";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const files = glob.sync("src/**/*.{js,ts}");

export default defineConfig({
  build: {
    lib: {
      entry: files.map((file) => resolve(__dirname, file)),
      formats: ["es"],
    },
  },
  plugins: [dts()],
});
