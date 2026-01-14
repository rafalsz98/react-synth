import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      include: ["src/**/*"],
      exclude: ["src/**/*.test.ts", "cli/**/*"],
      rollupTypes: true,
    }),
  ],
  build: {
    target: "node18",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        cli: resolve(__dirname, "cli/cli.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const ext = format === "es" ? "js" : "cjs";
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "node-web-audio-api",
        "jsdom",
        "vite",
        "path",
        "url",
        "fs",
        "fs/promises",
        "os",
        "crypto",
        "module",
        "@react-synth/synth",
      ],
      output: {
        // Rewrite package import to relative import in dist
        paths: {
          "@react-synth/synth": "./index.js",
        },
      },
    },
    outDir: "dist",
    sourcemap: true,
    minify: false,
  },
});
